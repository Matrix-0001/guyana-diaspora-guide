// Fetches a user-provided vehicle listing URL (BE FORWARD, SBT Japan, etc.)
// and extracts price / engine / year / fuel for the import duty calculator.
// Best-effort parsing: JSON-LD Product data first, then meta tags, then text patterns.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

function firstMatch(html, patterns) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function parseJsonLd(html) {
  const out = {};
  const scripts = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of scripts) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      for (const node of nodes) {
        const type = String(node['@type'] || '');
        if (/Product|Car|Vehicle/i.test(type)) {
          if (!out.title && node.name) out.title = String(node.name);
          if (!out.image && node.image) out.image = node.image;
          if (!out.description && node.description) out.description = String(node.description);
          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          if (offers && offers.price && !out.price) {
            const p = parseFloat(String(offers.price).replace(/[^\d.]/g, ''));
            if (p > 0) {
              out.price = p;
              out.currency = String(offers.priceCurrency || '').toUpperCase() || null;
            }
          }
          if (offers && offers.availability && /SoldOut|OutOfStock|Discontinued/i.test(String(offers.availability))) {
            out.sold = true;
          }
          if (node.vehicleEngine?.engineDisplacement && !out.cc) {
            const cc = parseFloat(String(node.vehicleEngine.engineDisplacement).replace(/[^\d.]/g, ''));
            if (cc > 0) out.cc = cc < 20 ? Math.round(cc * 1000) : Math.round(cc);
          }
          if (node.modelDate && !out.year) out.year = parseInt(node.modelDate, 10) || null;
          if (node.fuelType && !out.fuel) out.fuel = String(node.fuelType);
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return out;
}

export default async (req) => {
  const fail = (error, status = 400) =>
    Response.json({ ok: false, error }, { status, headers: { 'cache-control': 'no-store' } });

  const target = new URL(req.url).searchParams.get('url');
  if (!target) return fail('Missing url parameter');

  let u;
  try {
    u = new URL(target);
  } catch {
    return fail('That does not look like a valid link');
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return fail('Only http(s) links are supported');
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    !host.includes('.')
  ) {
    return fail('That host is not allowed');
  }

  let res;
  try {
    res = await fetch(u.href, {
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return fail('Could not reach that site — it may be slow or blocking automated requests', 502);
  }
  if (res.status === 404 || res.status === 410) {
    return fail('That listing no longer exists — it was likely sold or removed. Pick a live listing or enter the details manually', 502);
  }
  if (!res.ok) return fail(`The listing site returned an error (${res.status})`, 502);

  const html = (await res.text()).slice(0, 900000);

  // Bot-protected sites (e.g. Car From Japan) return an empty body or a
  // Cloudflare challenge page instead of the listing — tell the user plainly.
  if (
    html.length < 2000 ||
    /just a moment|cf-challenge|cf_chl_|attention required.{0,40}cloudflare|verifying you are human/i.test(html)
  ) {
    return fail(
      'This site blocks automated readers, so the listing can’t be fetched — copy the price and vehicle details in manually',
      502
    );
  }

  const ld = parseJsonLd(html);

  const title =
    ld.title ||
    firstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]);

  let price = ld.price || null;
  let currency = ld.currency || null;
  if (!price) {
    const ogPrice = firstMatch(html, [
      /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([\d,.]+)["']/i,
      /<meta[^>]+itemprop=["']price["'][^>]+content=["']([\d,.]+)["']/i,
    ]);
    if (ogPrice) price = parseFloat(ogPrice.replace(/,/g, ''));
  }
  if (!price) {
    // Prefer amounts labelled "total", then any USD amount
    const totalNear = firstMatch(html, [
      /total[^<>$]{0,60}?(?:US\$|USD\s?|\$)\s*([\d,]{3,10})/i,
      /(?:US\$|USD)\s*([\d,]{3,10})/,
      /\$\s*([\d,]{4,10})/,
    ]);
    if (totalNear) {
      price = parseFloat(totalNear.replace(/,/g, ''));
      currency = currency || 'USD';
    }
  }
  if (price && (price < 300 || price > 500000)) price = null;

  const searchSpace = `${title || ''} ${html}`;
  let cc = ld.cc || null;
  if (!cc) {
    const ccMatch = firstMatch(searchSpace, [
      /engine\s*(?:size|capacity|displacement)?[^<]{0,120}?([\d,]{3,5})\s*cc/i,
      /([\d,]{3,5})\s*cc/i,
    ]);
    if (ccMatch) {
      const v = parseFloat(ccMatch.replace(/,/g, ''));
      if (v >= 500 && v <= 8000) cc = Math.round(v);
    }
  }
  if (!cc) {
    const litres = firstMatch(searchSpace, [/(\d\.\d)\s*L\b/i]);
    if (litres) cc = Math.round(parseFloat(litres) * 1000);
  }

  let year = ld.year || null;
  if (!year) {
    const y = firstMatch(`${title || ''}`, [/\b(19[89]\d|20[0-2]\d)\b/]) ||
      firstMatch(html, [
        /(?:reg\.?\s*year|registration(?:\s*year)?|model\s*year|year)\s*[:<][^<]{0,120}?\b((?:19[89]|20[0-2])\d)\b/i,
        /\b((?:19[89]|20[0-2])\d)\s*\/\s*(?:0?[1-9]|1[0-2])\b/,
      ]);
    if (y) {
      const parsed = parseInt(y, 10);
      if (parsed >= 1985 && parsed <= new Date().getFullYear() + 1) year = parsed;
    }
  }

  // Fuel: trust an explicit spec field first, then the title/name.
  // Never scan the whole page — nav links ("Hybrid Cars") cause false positives.
  const classify = (s) => {
    if (!s) return null;
    if (/hybrid/i.test(s)) return 'hybrid';
    if (/diesel/i.test(s)) return 'diesel';
    if (/\belectric\b|\bBEV\b|\bEV\b/i.test(s)) return 'electric';
    if (/petrol|gasoline/i.test(s)) return 'gasoline';
    return null;
  };
  const fuelField = firstMatch(html, [
    /fuel(?:\s*type)?\s*[:<][^<]{0,160}?(petrol|gasoline|diesel|hybrid|electric)/i,
    // Prose adjacency: "660cc petrol engine", "2.8L diesel" — safe from nav-link noise
    /[\d,]{3,5}\s*cc\s+(petrol|gasoline|diesel|hybrid|electric)/i,
    /(petrol|gasoline|diesel|hybrid|electric)\s+engine/i,
  ]);
  const fuel = classify(ld.fuel) || classify(fuelField) || classify(title);

  // --- Images: og:image / JSON-LD first, then siblings from the same CDN directory ---
  const absolutize = (src) => {
    try {
      return new URL(src, u.href).href;
    } catch {
      return null;
    }
  };
  let images = [];
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) images.push(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi)) images.push(m[1]);
  if (ld.image) images.push(...(Array.isArray(ld.image) ? ld.image : [ld.image]).map(String));
  images = images.map(absolutize).filter(Boolean);
  if (images[0]) {
    // Listing galleries usually live in the same directory as the main photo
    const dir = images[0].slice(0, images[0].lastIndexOf('/') + 1).replace(/^https?:/, '');
    const dirEsc = dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const galleryRe = new RegExp(`(?:https?:)?${dirEsc}[A-Za-z0-9_\\-]+\\.(?:jpe?g|webp|png)`, 'gi');
    for (const m of html.matchAll(galleryRe)) {
      const a = absolutize(m[0]);
      if (a) images.push(a);
    }
  }
  images = [...new Set(images)].slice(0, 8);

  // --- Details prose + extra specs ---
  let details = null;
  const prose = firstMatch(html, [
    /([A-Z][^<>{}"]{40,450}?mileage[^<>{}"]{0,250}?\.)/,
    /([A-Z][^<>{}"]{40,450}?transmission[^<>{}"]{0,250}?\.)/,
  ]);
  if (prose) details = prose.replace(/\s+/g, ' ').trim().slice(0, 400);
  else if (ld.description) details = ld.description.replace(/\s+/g, ' ').trim().slice(0, 400);

  let mileageKm = null;
  const mileageMatch = firstMatch(html, [/mileage(?:\s*of)?[^<]{0,60}?([\d,]{2,7})\s*km/i]);
  if (mileageMatch) {
    const v = parseInt(mileageMatch.replace(/,/g, ''), 10);
    if (v > 0 && v < 1000000) mileageKm = v;
  }

  const transmission =
    firstMatch(`${details || ''}`, [/\b(automatic|manual|cvt)\b(?:\s+transmission)?/i]) ||
    firstMatch(html, [/transmission[^<]{0,80}?>?\s*(automatic|manual|cvt)\b/i]);

  const seats = firstMatch(`${details || ''}`, [/(\d{1,2})\s*seats/i]);
  const doors = firstMatch(`${details || ''}`, [/(\d)\s*doors/i]);

  const found = Boolean(price || cc || year);
  return Response.json(
    {
      ok: found,
      error: found ? undefined : 'Could not read vehicle details from that page — enter them manually',
      title: title ? title.slice(0, 160) : null,
      sold: Boolean(ld.sold),
      price,
      currency,
      cc,
      year,
      fuel,
      host,
      images,
      details,
      mileageKm,
      transmission: transmission ? transmission.toLowerCase() : null,
      seats: seats ? parseInt(seats, 10) : null,
      doors: doors ? parseInt(doors, 10) : null,
    },
    { headers: { 'cache-control': 'no-store' } }
  );
};

export const config = { path: '/api/fetch-listing' };

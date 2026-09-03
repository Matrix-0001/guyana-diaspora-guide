// Aggregates headlines from Guyana news outlets' public RSS feeds and returns
// them as JSON for the /news page to render client-side. This is a HEADLINES
// aggregator: we show each outlet's own title + syndication snippet and link
// back to the original article — we never republish full articles.
//
// Runs on demand (a Netlify Function, not a build), so the news stays fresh
// with zero rebuilds. Response is cached ~15 min to stay light on the sources.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const FEEDS = [
  { source: 'Kaieteur News', url: 'https://www.kaieteurnewsonline.com/feed/' },
  { source: 'Demerara Waves', url: 'https://demerarawaves.com/feed/' },
  { source: 'Guyana Chronicle', url: 'https://guyanachronicle.com/feed/' },
];

const clean = (s) =>
  (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // unwrap CDATA
    .replace(/<[^>]+>/g, ' ') // strip HTML tags
    .replace(/&#8230;/g, '…')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1] : '';
};

function parseFeed(xml, source) {
  const items = [];
  const blocks = xml.matchAll(/<item[\s\S]*?<\/item>/gi);
  for (const [block] of blocks) {
    const title = clean(pick(block, 'title'));
    const link = clean(pick(block, 'link')) || (block.match(/<link[^>]*>([^<]+)/i)?.[1] || '').trim();
    const pubRaw = clean(pick(block, 'pubDate'));
    const ts = pubRaw ? Date.parse(pubRaw) : NaN;
    let snippet = clean(pick(block, 'description'));
    if (snippet.length > 220) snippet = snippet.slice(0, 217).replace(/\s+\S*$/, '') + '…';
    if (title && link) {
      items.push({ title, link, source, published: Number.isFinite(ts) ? ts : null, snippet });
    }
  }
  return items;
}

export default async () => {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ source, url }) => {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`${source} ${res.status}`);
      return parseFeed(await res.text(), source);
    })
  );

  const items = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  // Newest first; undated items sink to the bottom.
  items.sort((a, b) => (b.published || 0) - (a.published || 0));

  const sources = FEEDS.map((f) => f.source);
  const failed = results
    .map((r, i) => (r.status === 'rejected' ? { source: FEEDS[i].source, error: String(r.reason?.message || r.reason) } : null))
    .filter(Boolean);

  return Response.json(
    { ok: items.length > 0, items: items.slice(0, 45), sources, failed, fetchedAt: Date.now() },
    {
      headers: {
        // Cache at the edge for 15 min; serve stale up to an hour while refreshing.
        'cache-control': 'public, max-age=900, stale-while-revalidate=3600',
      },
    }
  );
};

export const config = { path: '/api/news-feed' };

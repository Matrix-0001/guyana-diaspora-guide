// Shared Guyana news-feed fetching + parsing, used by both the on-demand
// reader (news-feed) and the scheduled accumulator (news-archive-cron).

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export const FEEDS = [
  { source: 'Kaieteur News', url: 'https://www.kaieteurnewsonline.com/feed/' },
  { source: 'Demerara Waves', url: 'https://demerarawaves.com/feed/' },
  { source: 'Guyana Chronicle', url: 'https://guyanachronicle.com/feed/' },
];

export const FEED_SOURCES = FEEDS.map((f) => f.source);

const clean = (s) =>
  (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
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
  for (const [block] of xml.matchAll(/<item[\s\S]*?<\/item>/gi)) {
    const title = clean(pick(block, 'title'));
    const link = clean(pick(block, 'link')) || (block.match(/<link[^>]*>([^<]+)/i)?.[1] || '').trim();
    const pubRaw = clean(pick(block, 'pubDate'));
    const ts = pubRaw ? Date.parse(pubRaw) : NaN;
    let snippet = clean(pick(block, 'description'));
    if (snippet.length > 220) snippet = snippet.slice(0, 217).replace(/\s+\S*$/, '') + '…';
    if (title && link) items.push({ title, link, source, published: Number.isFinite(ts) ? ts : null, snippet });
  }
  return items;
}

// Fetches all feeds in parallel; a failing feed is skipped, not fatal.
export async function fetchAllFeeds() {
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
  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
}

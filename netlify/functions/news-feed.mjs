// On-demand news reader for the /news page.
//   • Default (no ?q): returns the latest ~45 live headlines (freshest view).
//   • Search (?q=term): searches the rolling 6-month archive (Netlify Blobs,
//     populated by news-archive-cron) merged with the current live feed.
// A headlines aggregator that links out — never republishes full articles.

import { getStore } from '@netlify/blobs';
import { fetchAllFeeds, FEED_SOURCES } from '../lib/feeds.mjs';

const CACHE = { 'cache-control': 'public, max-age=900, stale-while-revalidate=3600' };

async function readArchive() {
  try {
    const arr = await getStore('news-archive').get('items', { type: 'json' });
    return Array.isArray(arr) ? arr : [];
  } catch {
    return []; // no store yet (fresh deploy) or unavailable (local dev)
  }
}

const byNewest = (a, b) => (b.published || 0) - (a.published || 0);

function dedupe(list) {
  const byLink = new Map();
  for (const it of list) if (it?.link && !byLink.has(it.link)) byLink.set(it.link, it);
  return [...byLink.values()];
}

export default async (req) => {
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();

  if (q) {
    const [archive, live] = await Promise.all([readArchive(), fetchAllFeeds().catch(() => [])]);
    const results = dedupe([...archive, ...live])
      .filter((i) => `${i.title} ${i.snippet || ''}`.toLowerCase().includes(q))
      .sort(byNewest)
      .slice(0, 120);
    return Response.json(
      { ok: results.length > 0, q, items: results, archived: archive.length, fetchedAt: Date.now() },
      { headers: CACHE }
    );
  }

  const live = (await fetchAllFeeds().catch(() => [])).sort(byNewest);
  return Response.json(
    { ok: live.length > 0, items: live.slice(0, 45), sources: FEED_SOURCES, fetchedAt: Date.now() },
    { headers: CACHE }
  );
};

export const config = { path: '/api/news-feed' };

// Scheduled function (runs hourly, NOT a rebuild — costs no build minutes).
// Fetches the current feeds and folds any new headlines into a rolling archive
// in Netlify Blobs, de-duped by link and pruned to the last 6 months. The
// /news search reads this archive so users can find older stories.

import { getStore } from '@netlify/blobs';
import { fetchAllFeeds } from '../lib/feeds.mjs';

const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;

export default async () => {
  const store = getStore('news-archive');
  const now = Date.now();

  const existing = (await store.get('items', { type: 'json' }).catch(() => null)) || [];
  const live = await fetchAllFeeds();

  // Keep existing entries as-is; add live items we haven't seen (by link).
  const byLink = new Map();
  for (const it of existing) if (it?.link) byLink.set(it.link, it);
  for (const it of live) {
    if (it?.link && !byLink.has(it.link)) {
      byLink.set(it.link, { ...it, published: it.published || now, archivedAt: now });
    }
  }

  const cutoff = now - SIX_MONTHS;
  const merged = [...byLink.values()]
    .filter((it) => (it.published || it.archivedAt || 0) >= cutoff)
    .sort((a, b) => (b.published || 0) - (a.published || 0));

  await store.setJSON('items', merged);

  return Response.json({ ok: true, total: merged.length, addedFrom: live.length, at: now });
};

export const config = { schedule: '@hourly' };

// Rates to GYD. Fallback values are used when the rate API is unreachable at
// build time; otherwise fresh mid-market rates are fetched on every build.
// Client-side scripts on converter pages additionally refresh rates on page load.
const FALLBACK = {
  usd: 208.5,
  cad: 152,
  gbp: 265,
};

let rates = { ...FALLBACK };
let ratesUpdated = 'July 2026 (approximate)';

try {
  const res = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(8000),
  });
  if (res.ok) {
    const data = await res.json();
    if (data.result === 'success' && data.rates?.GYD && data.rates?.CAD && data.rates?.GBP) {
      const round = (n: number) => Math.round(n * 100) / 100;
      rates = {
        usd: round(data.rates.GYD),
        cad: round(data.rates.GYD / data.rates.CAD),
        gbp: round(data.rates.GYD / data.rates.GBP),
      };
      ratesUpdated = new Date(data.time_last_update_utc).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
} catch {
  // Offline or API down — fall back to the static rates above.
}

export const RATES_UPDATED = ratesUpdated;

export const CURRENCIES = {
  usd: { code: 'USD', name: 'US dollar', plural: 'US dollars', symbol: 'US$', rate: rates.usd, region: 'the United States' },
  cad: { code: 'CAD', name: 'Canadian dollar', plural: 'Canadian dollars', symbol: 'CA$', rate: rates.cad, region: 'Canada' },
  gbp: { code: 'GBP', name: 'British pound', plural: 'British pounds', symbol: '£', rate: rates.gbp, region: 'the United Kingdom' },
} as const;

export type CurrencyKey = keyof typeof CURRENCIES;

export const AMOUNTS = [1, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];

export function formatGyd(value: number): string {
  return 'G$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

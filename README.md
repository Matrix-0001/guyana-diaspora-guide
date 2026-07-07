# Guyana Diaspora Guide

Practical guides for Guyanese living abroad — sending money home, sponsoring family,
renewing passports, shipping barrels, and buying property in Guyana. Built by
[Savanna Studios](mailto:savannaastudios@gmail.com).

Static site built with [Astro](https://astro.build), deployed on Netlify.

## Develop

```sh
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # production build to dist/
```

## How it's organized

- `src/content/articles/` — guides in Markdown; frontmatter sets title, description,
  category (`money` / `immigration` / `documents` / `property`), publish date, and FAQs
  (rendered on the page and emitted as FAQPage schema). Add a `.md` file to publish.
- `src/pages/convert/` — programmatic currency converter pages (USD/CAD/GBP → GYD),
  generated from `src/lib/currencies.ts`. Rates are fetched from open.er-api.com at
  build time (with static fallbacks) and refreshed live in the browser on page load.
- `src/pages/tools/` — remittance fee calculator, barrel shipping calculator, and
  family sponsorship wait-time estimator.
- Ad slots are placeholder `.ad-slot` divs; the AdSense script tag goes in
  `src/layouts/BaseLayout.astro` once the site is approved.

## When the custom domain is purchased

Update the `site` URL in `astro.config.mjs` and the Sitemap line in
`public/robots.txt`, then rebuild.

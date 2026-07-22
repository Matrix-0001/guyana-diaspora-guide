import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dev-only shim: serve the Netlify function at /api/fetch-listing under
// `astro dev`, so the listing reader can be tested locally. In production
// Netlify serves the real function; this plugin does nothing at build time.
function devFetchListingApi() {
  return {
    name: 'dev-fetch-listing-api',
    configureServer(server) {
      server.middlewares.use('/api/fetch-listing', async (req, res) => {
        try {
          const { default: handler } = await import('./netlify/functions/fetch-listing.mjs');
          const request = new Request(`http://localhost${req.originalUrl || req.url}`);
          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
        }
      });
    },
  };
}

export default defineConfig({
  // Netlify subdomain for now — swap to the custom domain here (and in
  // public/robots.txt) once purchased.
  site: 'https://guyana-diaspora-guide.netlify.app',
  integrations: [sitemap()],
  vite: {
    plugins: [devFetchListingApi()],
  },
});

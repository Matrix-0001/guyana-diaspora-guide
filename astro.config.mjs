import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dev-only shim: serve our Netlify functions at /api/<name> under `astro dev`,
// so they can be tested locally. In production Netlify serves the real
// functions; this plugin does nothing at build time.
const DEV_FUNCTIONS = ['fetch-listing', 'news-feed'];

function devNetlifyFunctions() {
  return {
    name: 'dev-netlify-functions',
    configureServer(server) {
      for (const name of DEV_FUNCTIONS) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          try {
            const { default: handler } = await import(`./netlify/functions/${name}.mjs`);
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
      }
    },
  };
}

export default defineConfig({
  // Netlify subdomain for now — swap to the custom domain here (and in
  // public/robots.txt) once purchased.
  site: 'https://guyana-diaspora-guide.netlify.app',
  integrations: [sitemap()],
  vite: {
    plugins: [devNetlifyFunctions()],
  },
});

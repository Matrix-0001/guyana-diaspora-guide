import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Netlify subdomain for now — swap to the custom domain here (and in
  // public/robots.txt) once purchased.
  site: 'https://guyana-diaspora-guide.netlify.app',
  integrations: [sitemap()],
});

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical site URL.
 * 1. SITE_URL (set it in Vercel for Production once the final domain is known)
 * 2. Vercel's production domain for this project (never a preview URL)
 * 3. localhost for local development
 */
const site =
  process.env.SITE_URL?.replace(/\/+$/, '') ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

/** Only the production deployment may be indexed by search engines. */
const indexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => indexable && !page.endsWith('.vcf') })],
  vite: {
    define: {
      __INDEXABLE__: JSON.stringify(indexable),
    },
  },
});

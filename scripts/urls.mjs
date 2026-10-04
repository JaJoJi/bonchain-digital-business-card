// Prints the permanent public URLs (home + every member profile) for the
// external QR code vendor.  Usage:  SITE_URL=https://example.com pnpm urls
import { readdirSync } from 'node:fs';

const site = (process.env.SITE_URL || 'https://bonchain.example').replace(/\/+$/, '');
const slugs = readdirSync(new URL('../content/members/', import.meta.url))
  .filter((f) => /\.ya?ml$/i.test(f))
  .map((f) => f.replace(/\.ya?ml$/i, ''))
  .sort();

if (!process.env.SITE_URL) console.error('! SITE_URL not set — using a placeholder domain.\n');
console.log(`${site}/`);
for (const slug of slugs) console.log(`${site}/members/${slug}`);

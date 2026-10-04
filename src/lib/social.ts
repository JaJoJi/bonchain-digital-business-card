/**
 * Normalisers for social handles. Data files may contain "@handle", a bare
 * handle or a full profile URL; everything is reduced to one canonical form.
 */

const TELEGRAM_USERNAME = /^[A-Za-z][A-Za-z0-9_]{3,31}$/;
const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const X_USERNAME = /^[A-Za-z0-9_]{1,15}$/;

function stripHandle(value: string, hosts: string[]): string {
  let v = value.trim();
  for (const host of hosts) {
    const re = new RegExp(`^(?:https?://)?(?:www\\.)?${host.replaceAll('.', '\\.')}/`, 'i');
    v = v.replace(re, '');
  }
  return v.replace(/^@/, '').replace(/[/?#].*$/, '');
}

export function normalizeTelegram(value: string): string | null {
  const handle = stripHandle(value, ['t.me', 'telegram.me']);
  return TELEGRAM_USERNAME.test(handle) ? handle : null;
}

export function normalizeGithub(value: string): string | null {
  const handle = stripHandle(value, ['github.com']);
  return GITHUB_USERNAME.test(handle) ? handle : null;
}

export function normalizeX(value: string): string | null {
  const handle = stripHandle(value, ['x.com', 'twitter.com']);
  return X_USERNAME.test(handle) ? handle : null;
}

/** LinkedIn accepts a full URL or an "in/handle" / bare handle. Returns a full URL. */
export function normalizeLinkedin(value: string): string | null {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) {
    try {
      const url = new URL(v);
      return /(^|\.)linkedin\.com$/i.test(url.hostname) ? url.toString().replace(/\/$/, '') : null;
    } catch {
      return null;
    }
  }
  const handle = v.replace(/^@/, '').replace(/^in\//i, '').replace(/\/$/, '');
  return /^[A-Za-z0-9-_%]{2,100}$/.test(handle) ? `https://www.linkedin.com/in/${handle}` : null;
}

/** "https://www.example.com/path/" → "example.com/path" for display. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

export const profileUrls = {
  telegram: (u: string) => `https://t.me/${u}`,
  github: (u: string) => `https://github.com/${u}`,
  x: (u: string) => `https://x.com/${u}`,
};

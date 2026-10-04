/**
 * Minimal vCard 3.0 writer (RFC 2426). Version 3.0 is the most widely
 * importable format on iOS and Android.
 */

export interface VCardInput {
  name: string;
  nickname?: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  note?: string;
  /** Primary URL (the member's profile page). */
  url?: string;
  /** Additional labelled URLs, e.g. Telegram, LinkedIn. */
  links?: { label: string; url: string }[];
  /** Social profiles (iOS shows these in the contact card). */
  socials?: { type: string; url: string; user?: string }[];
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** Fold lines longer than 75 octets (UTF-8 aware), per RFC 2425 §5.8.1. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const charSize = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (size + charSize > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += charSize;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/** Split "First Middle Last" into vCard N components (family; given). */
function splitName(name: string): { family: string; given: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { family: '', given: parts[0] };
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(' ') };
}

export function buildVCard(input: VCardInput): string {
  const { family, given } = splitName(input.name);
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeText(family)};${escapeText(given)};;;`,
    `FN:${escapeText(input.name)}`,
  ];
  if (input.nickname) lines.push(`NICKNAME:${escapeText(input.nickname)}`);
  if (input.organization) lines.push(`ORG:${escapeText(input.organization)}`);
  if (input.title) lines.push(`TITLE:${escapeText(input.title)}`);
  if (input.email) lines.push(`EMAIL;TYPE=INTERNET:${input.email}`);
  if (input.phone) lines.push(`TEL;TYPE=CELL:${input.phone.replace(/[^\d+]/g, '')}`);
  if (input.url) lines.push(`URL:${input.url}`);
  input.links?.forEach((link, i) => {
    lines.push(`item${i + 1}.URL:${link.url}`);
    lines.push(`item${i + 1}.X-ABLabel:${escapeText(link.label)}`);
  });
  input.socials?.forEach((s) => {
    const user = s.user ? `;x-user=${s.user}` : '';
    lines.push(`X-SOCIALPROFILE;TYPE=${s.type}${user}:${s.url}`);
  });
  if (input.note) lines.push(`NOTE:${escapeText(input.note)}`);
  lines.push('END:VCARD');
  return lines.map(fold).join('\r\n') + '\r\n';
}

import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { telegramChatUrl } from './telegram';

export type Member = CollectionEntry<'members'>;
export type Project = CollectionEntry<'projects'>;

const byOrderThenName = <T extends { data: { order: number; name: string } }>(a: T, b: T) =>
  a.data.order - b.data.order || a.data.name.localeCompare(b.data.name);

export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('content/site.yaml is missing');
  return entry.data;
}

export async function getMembers(): Promise<Member[]> {
  return (await getCollection('members')).sort(byOrderThenName);
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort(byOrderThenName);
}

// Every project is a whole-team effort: each member is on every project,
// so member pages list all projects and project pages list all members.

/** Canonical URL path for a member. This is what QR codes point to. */
export const memberPath = (slug: string) => `/members/${slug}`;
export const vcardPath = (slug: string) => `/members/${slug}.vcf`;

/**
 * Clean public path for the current page. Static builds report
 * "/members/x.html" or "/index.html"; the public URL is "/members/x" or "/".
 */
export const cleanPath = (pathname: string) =>
  pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';

/** Absolute URL on the canonical domain (never a preview URL). */
export const absoluteUrl = (path: string) => new URL(path, import.meta.env.SITE).toString();

export async function contactMessageFor(member: Member): Promise<string> {
  const site = await getSite();
  return member.data.contactMessageOverride ?? site.event.contactMessage;
}

export async function telegramContactUrl(member: Member): Promise<string | null> {
  if (!member.data.telegram) return null;
  return telegramChatUrl(member.data.telegram, await contactMessageFor(member));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}

/** The short name to address someone by: nickname if set, else first name. */
export function callName(member: Member['data']): string {
  return member.nickname ?? firstName(member.name);
}

/**
 * Static vCard per member: /members/<slug>.vcf
 * Email and phone are included only when the member opted in by adding them
 * to their data file.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { absoluteUrl, getMembers, getSite, memberPath, type Member } from '../../lib/data';
import { profileUrls } from '../../lib/social';
import { buildVCard } from '../../lib/vcard';

export const getStaticPaths = (async () => {
  const members = await getMembers();
  return members.map((member) => ({ params: { slug: member.id }, props: { member } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { member } = props as { member: Member };
  const m = member.data;
  const site = await getSite();

  const links: { label: string; url: string }[] = [];
  const socials: { type: string; url: string; user?: string }[] = [];
  if (m.telegram) {
    links.push({ label: 'Telegram', url: profileUrls.telegram(m.telegram) });
    socials.push({ type: 'telegram', url: profileUrls.telegram(m.telegram), user: m.telegram });
  }
  if (m.linkedin) {
    links.push({ label: 'LinkedIn', url: m.linkedin });
    socials.push({ type: 'linkedin', url: m.linkedin });
  }
  if (m.github) links.push({ label: 'GitHub', url: profileUrls.github(m.github) });
  if (m.x) {
    links.push({ label: 'X', url: profileUrls.x(m.x) });
    socials.push({ type: 'twitter', url: profileUrls.x(m.x), user: m.x });
  }
  if (m.website) links.push({ label: 'Website', url: m.website });

  const body = buildVCard({
    name: m.name,
    nickname: m.nickname,
    organization: site.name,
    title: m.role,
    email: m.email,
    phone: m.phone,
    url: absoluteUrl(memberPath(member.id)),
    links,
    socials,
    note: site.event.showBadge ? `Met at ${site.event.name}` : undefined,
  });

  return new Response(body, {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  });
};

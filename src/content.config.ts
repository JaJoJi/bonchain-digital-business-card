/**
 * Content schemas. Everything public on the site comes from /content.
 * A typo or invalid value fails the build instead of shipping a broken page.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  normalizeGithub,
  normalizeLinkedin,
  normalizeTelegram,
  normalizeX,
} from './lib/social';

/** URL slugs are permanent (they end up printed in QR codes). */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The id of each entry is its filename, which must be a valid slug. */
function slugFromFilename({ entry }: { entry: string }): string {
  const slug = entry.replace(/\.(ya?ml|json)$/i, '');
  if (!SLUG.test(slug)) {
    throw new Error(
      `Invalid file name "${entry}". Use lowercase letters, numbers and hyphens only (e.g. "jane-doe.yaml") — the file name becomes the permanent URL.`,
    );
  }
  return slug;
}

const handle = (normalize: (v: string) => string | null, label: string) =>
  z.string().transform((value, ctx) => {
    const result = normalize(value);
    if (!result) {
      ctx.addIssue({ code: 'custom', message: `Invalid ${label}: "${value}"` });
      return z.NEVER;
    }
    return result;
  });

const httpUrl = z.url({ protocol: /^https?$/ });

const site = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './content', generateId: () => 'site' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    intro: z.string(),
    about: z.array(z.string()).default([]),
    focus: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    origin: z
      .object({ name: z.string(), url: httpUrl.optional(), text: z.string() })
      .optional(),
    socials: z
      .object({
        telegram: handle(normalizeTelegram, 'Telegram username').optional(),
        x: handle(normalizeX, 'X username').optional(),
        github: handle(normalizeGithub, 'GitHub username').optional(),
        linkedin: handle(normalizeLinkedin, 'LinkedIn URL').optional(),
        website: httpUrl.optional(),
      })
      .default({}),
    event: z
      .object({
        name: z.string(),
        location: z.string().optional(),
        dates: z.string().optional(),
        showBadge: z.boolean().default(true),
        contactMessage: z.string(),
      }),
  }),
});

const members = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: './content/members', generateId: slugFromFilename }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      /** What people call you, e.g. "Bon". Shown on the card and used in buttons. */
      nickname: z.string().min(1).optional(),
      role: z.string().min(1),
      headline: z.string().optional(),
      bio: z.string().optional(),
      location: z.string().optional(),
      avatar: image().optional(),
      telegram: handle(normalizeTelegram, 'Telegram username').optional(),
      linkedin: handle(normalizeLinkedin, 'LinkedIn URL').optional(),
      github: handle(normalizeGithub, 'GitHub username').optional(),
      x: handle(normalizeX, 'X username').optional(),
      website: httpUrl.optional(),
      // Opt-in only: leave empty unless the member wants these public.
      email: z.email().optional(),
      phone: z
        .string()
        .regex(/^\+?[\d\s().-]{6,20}$/, 'Use international format, e.g. +65 9123 4567')
        .optional(),
      contactMessageOverride: z.string().optional(),
      order: z.number().default(100),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: './content/projects', generateId: slugFromFilename }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      /** "product" for things we build, "event" for things we host. */
      kind: z.enum(['product', 'event']).default('product'),
      summary: z.string(),
      description: z.string().optional(),
      logo: image().optional(),
      /** Wide photo shown at the top of the project card, e.g. an event photo. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Photos opened in a viewer when the cover is tapped. */
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      status: z.enum(['live', 'building', 'research', 'archived']).optional(),
      tags: z.array(z.string()).default([]),
      awards: z.array(z.object({ title: z.string(), url: httpUrl.optional() })).default([]),
      links: z
        .object({
          website: httpUrl.optional(),
          github: httpUrl.optional(),
          demo: httpUrl.optional(),
          docs: httpUrl.optional(),
          facebook: httpUrl.optional(),
          x: handle(normalizeX, 'X username').optional(),
        })
        .default({}),
      order: z.number().default(100),
    }),
});

export const collections = { site, members, projects };

# Bonchain Digital Network

Community directory and digital business cards for Bonchain members.
Static site built with [Astro](https://astro.build), deployed on Vercel. No backend, database or CMS.

```
QR code → /members/<slug> → Contact Me → Telegram (message pre-filled, you press Send)
```

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static output in dist/
pnpm preview    # serve the build locally
```

Requires Node 22.12+ (see `.nvmrc`).

## Editing content

All public content lives in `content/`. Edit a file, commit, push — Vercel rebuilds the site.

```
content/
  site.yaml                 site text, event name, Contact Me message
  members/<slug>.yaml       one file per member
  members/avatars/          member photos
  projects/<slug>.yaml      one file per project
  projects/logos/           project logos
```

The build validates every file. A typo (bad URL, unknown project, invalid Telegram username)
fails the build with a clear message instead of publishing a broken page.

### Adding a member

1. Create `content/members/<slug>.yaml` — copy an existing file as a template.
2. Optionally add a square photo (min 400×400) to `content/members/avatars/` and reference it:
   `avatar: ./avatars/<slug>.jpg`. Large phone photos are fine; they are resized at build time.
3. Commit and push.

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Full name |
| `nickname` | | What people call you, e.g. "Bon". Shown as "Call me …" and used in buttons and the contact card |
| `role` | yes | e.g. "Blockchain Developer" |
| `headline` | | One short line for directory cards |
| `bio` | | 2–3 sentences |
| `location` | | e.g. "Singapore" |
| `avatar` | | `./avatars/<file>` — initials are shown if missing |
| `telegram` | | Username (`name`, `@name` or `t.me/name`). **Required for Contact Me.** Must be a public username. |
| `linkedin` | | Full URL or handle |
| `github` | | Username or URL |
| `x` | | Username or URL |
| `website` | | Full URL |
| `email` | | **Opt-in only.** Shown on the profile and added to the contact card. |
| `phone` | | **Opt-in only.** International format, e.g. `"+65 9123 4567"`. |
| `contactMessageOverride` | | Replaces the event message for this member |
| `order` | | Lower numbers appear first (default 100) |

If a member has no Telegram, the main button falls back to Email, then LinkedIn.

### Projects and events

There is one shared list of projects for Bonchain and its members. Every project is a
whole-team effort: each member profile shows all projects, and the Projects page shows the
whole team. Many projects have no public website — a GitHub link and a description are enough.

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | |
| `kind` | | `product` (default) or `event` — events get an "Event" label |
| `summary` | yes | One sentence |
| `description` | | A few more sentences (Projects page) |
| `logo` | | `./logos/<file>` — square |
| `cover` | | `./covers/<file>` — wide photo shown on top of the card (e.g. an event photo) |
| `coverAlt` | | Short description of the cover photo |
| `gallery` | | List of `{ src, alt }` photos (e.g. `./gallery/<slug>/01.jpg`). Tapping the cover opens them in a swipeable viewer |
| `status` | | `live`, `building`, `research` or `archived` |
| `tags` | | e.g. `[Sui, Move]` |
| `awards` | | List of `{ title, url }` — shown with a trophy |
| `links` | | `website`, `github`, `demo`, `docs`, `facebook` (URLs) and `x` (username) |
| `order` | | Lower numbers appear first |

### Permanent URLs (important for QR codes)

- The **file name is the URL**: `content/members/jane-doe.yaml` → `/members/jane-doe`.
- Use lowercase letters, numbers and hyphens only.
- **Never rename a member file after QR codes are printed.** If you must, add a permanent
  redirect in `vercel.json`:
  ```json
  "redirects": [{ "source": "/members/old-slug", "destination": "/members/new-slug", "permanent": true }]
  ```
- Changing a member's display name does not change their URL.

### Contact Me message

Set in `content/site.yaml` under `event.contactMessage`. The button opens
`https://t.me/<username>?text=<message>`: Telegram opens the chat with the message typed
in, and the visitor reviews it and presses Send. Nothing is sent automatically. A
**Copy message** button is always available as a fallback.

## Domain and QR codes

QR codes are generated externally. The site only guarantees stable URLs.

1. Set the production domain in Vercel → Settings → Environment Variables:
   `SITE_URL=https://your-domain` (Production). If unset, Vercel's production domain is used.
   Preview deployments are never used as canonical URLs and are marked `noindex`.
2. Print the final URL list for the QR vendor:
   ```bash
   SITE_URL=https://your-domain pnpm urls
   ```

## Deployment (Vercel)

1. Import the GitHub repository in Vercel. The Astro preset is detected automatically
   (build `pnpm build`, output `dist`).
2. Add the production domain and set `SITE_URL`.
3. Every push to `main` rebuilds and deploys.

`vercel.json` serves clean URLs without trailing slashes and the correct content type
for `.vcf` contact cards.

Docker is intentionally not used: Vercel builds from Git and the output is static files.

## Branding

The visual identity is temporary ("Sky + Clouds + Network"). To rebrand:

- Colours, type, radii, shadows: `src/styles/tokens.css`
- Logo: `src/components/BrandMark.astro` and `public/favicon.svg`
- Social preview image: `public/og-default.png` (1200×630)
- Sky / cloud / network background: `src/components/SkyBackground.astro`

## Project structure

```
src/
  content.config.ts    content schemas (validation)
  lib/                 data access, Telegram links, vCard writer, social normalisers
  layouts/             BaseLayout (meta tags, header, footer, sky)
  components/          UI components
  pages/               routes: /, /members, /members/[slug], /members/[slug].vcf, /projects, /about, 404
scripts/urls.mjs       URL list for QR codes
```

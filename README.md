# Pubman

A mobile-first web app for planning and running pub crawls together. Browse preset routes in Stockholm, Göteborg, and Malmö — or build your own. Start a group session, share a code so friends can join, and track everyone's progress in real time on the map.

## Features

- **Browse preset rounds** — filter by city and tags (uteservering, rooftop)
- **Custom rounds** — pick your own bars and save the route to the shared list or just run it once
- **Group sessions** — start a session and share a 6-character join code
- **Per-participant tracking** — each person checks in and out independently; everyone sees everyone else's position in real time
- **Live map** — Leaflet + OpenStreetMap showing numbered markers, a connecting route line, and avatar indicators per stop
- **Profile & statistics** — see total beers, unique bars, and rounds attended; change display name and avatar

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + SSR) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + Realtime) |
| Maps | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Package manager | [Bun](https://bun.com/) |

## Prerequisites

- [Bun](https://bun.com/) — `brew install bun` on macOS or see [bun.com/docs/installation](https://bun.com/docs/installation)
- A [Supabase](https://supabase.com/) project with the schema applied (see below)

## Getting started

```bash
git clone git@github.com:erikredmo/pubman.git
cd pubman
bun install
```

Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon public key |

Start the development server:

```bash
bun run dev
```

The app is designed mobile-first. Use your browser's device toolbar (Chrome DevTools → Toggle device toolbar) or open the URL on your phone over the same network for the intended experience.

## Database setup

Run `database.sql` in the Supabase SQL editor (Dashboard → SQL Editor → New query). It is idempotent and safe to re-run — it creates tables, enables RLS, sets policies, and seeds initial data.

## Available scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the dev server with hot module reload |
| `bun run build` | Build for production (client + SSR bundles) |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format with Prettier |

## Project structure

```
src/
├── components/    Shared UI components (TopBar, BottomNav, Icon)
├── lib/           Supabase client + database types
├── routes/        File-based routes — one file per page
│   ├── index.tsx      Login / user selection
│   ├── discover.tsx   Browse and create rounds
│   ├── round.tsx      Active round view with check-in/out
│   ├── map.tsx        Live map of the active round
│   └── profile.tsx    Statistics and account settings
├── router.tsx     Router configuration
├── server.ts      Cloudflare Workers SSR entry point
├── start.ts       TanStack Start server middleware
└── styles.css     Tailwind base + design tokens
```

## Deployment

The app targets Cloudflare Workers via the `@cloudflare/vite-plugin`. Build and deploy:

```bash
bun run build
bunx wrangler deploy
```

Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set as environment variables in your Cloudflare Workers project (Dashboard → Workers → Settings → Variables).

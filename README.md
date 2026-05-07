# Pubman

Pubman is a website where you can find the perfect pub crawl for the day. Follow along routes on the map, get descriptions of bars, restaurants, and interesting sites nearby, or any event during a specific day. Mark bucket lists, complete routes in record time (or record amount of beer) — the possibilities are yours!

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [Cloudflare Workers](https://workers.cloudflare.com/) — deployment target
- [Bun](https://bun.com/) — package manager / runtime

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer)
- [Bun](https://bun.com/) — install with `brew install bun` on macOS, or see [bun.com/docs/installation](https://bun.com/docs/installation)

## Getting started

Clone the repository and install dependencies:

```bash
git clone git@github.com:erikredmo/pubman.git
cd pubman
bun install
```

Start the development server:

```bash
bun run dev
```

The dev server URL will be printed in the terminal (typically `http://localhost:5173`). Open it in any browser — the site is designed mobile-first, so for the intended experience use your browser's device toolbar to emulate a phone, or open the URL on your phone over the same network.

## Available scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `bun run dev`      | Start the dev server with hot module reload   |
| `bun run build`    | Build for production (client + SSR bundles)   |
| `bun run preview`  | Preview the production build locally          |
| `bun run lint`     | Run ESLint                                    |
| `bun run format`   | Format the codebase with Prettier             |

## Project structure

```
src/
├── components/    Custom React components (TopBar, BottomNav, Icon)
├── lib/           SSR error handling helpers
├── routes/        File-based routes (TanStack Router)
├── router.tsx     Router setup
├── server.ts      Cloudflare Workers SSR entry
├── start.ts       TanStack Start server middleware
└── styles.css     Tailwind + design tokens
```

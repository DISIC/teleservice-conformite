# Téléservice Conformité

Monorepo of the French digital accessibility compliance service: `apps/teleservice`, the declaration application built with [Next.js](https://nextjs.org/), [Payload CMS](https://payloadcms.com/), and [tRPC](https://trpc.io/), and `apps/site`, the public RGAA 5 site (Next.js App Router exported as static HTML). The content pipeline will join as `packages/content` (see `docs/rgaa5-integration.md`).

## Layout

```
apps/teleservice/   the compliance application (Next.js, Payload, Postgres), port 3000
apps/site/          the public RGAA 5 site (Next.js App Router, static export), port 3001
packages/           shared packages (none yet)
docs/               ADRs, agent guides, RGAA 5 integration decisions
```

The workspace is managed by [pnpm](https://pnpm.io/) and orchestrated by [Turborepo](https://turbo.build/).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22
- pnpm, through Node's Corepack (`corepack enable`) — the version is pinned in `package.json`

### Installation

1. **Install dependencies** (from the repo root):

```bash
pnpm install
```

2. **Configure environment variables** for each application:

```bash
cp apps/teleservice/.env.example apps/teleservice/.env
cp apps/site/.env.example apps/site/.env
```

3. **Start the database and the mail catcher:**

```bash
docker compose up -d
```

4. **Start the development server:**

```bash
pnpm dev
```

5. Visit [http://localhost:3000](http://localhost:3000) for the teleservice and [http://localhost:3001](http://localhost:3001) for the RGAA 5 site.

## Everyday commands

All run from the repo root.

| Command                               | What it does                                    |
| ------------------------------------- | ----------------------------------------------- |
| `pnpm dev`                            | dev server of every app                         |
| `pnpm build`                          | production build of every package               |
| `pnpm test`                           | vitest in every package                         |
| `pnpm typecheck`                      | `tsc --noEmit` in every package                 |
| `pnpm run check` / `pnpm check:write` | oxlint + oxfmt, check or fix, repo-wide         |
| `pnpm --filter teleservice <script>`  | one app's own script (`payload`, `seed:dev`, …) |

## Deployment (Clever Cloud)

### Teleservice

The teleservice deploys from the repository root on a Node.js application. Clever Cloud detects `pnpm-lock.yaml` and reads the pnpm version from the `packageManager` field, and installs the whole workspace during its build phase.

| Variable                   | Value                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `CC_NODE_BUILD_TOOL`       | `pnpm` (or unset: the lockfile is detected)                                                                   |
| `CC_POST_BUILD_HOOK`       | `pnpm --filter teleservice payload generate:types && pnpm build && pnpm --filter teleservice payload migrate` |
| `CC_NODE_DEV_DEPENDENCIES` | `install` when `NODE_ENV=production` is set: the build needs dev dependencies (Turborepo, TypeScript)         |

The start command is the root `start` script (`pnpm --filter teleservice start`); set `CC_RUN_COMMAND` only to override it. The Payload CLI runs through the app's `payload` script so that it resolves the app's config and migrations.

### RGAA 5 site

`pnpm --filter site build` writes a fully static export to `apps/site/out/`, to be served by a Clever Cloud static application (`CC_WEBROOT=/apps/site/out`, build through `CC_POST_BUILD_HOOK=pnpm --filter site build`). Not deployed yet.

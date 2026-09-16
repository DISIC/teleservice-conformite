# Téléservice Conformité

pnpm + Turborepo monorepo with two applications: `apps/teleservice`, the Next.js + Payload CMS + tRPC application for managing digital service compliance, and `apps/site`, the public RGAA 5 site (Next.js App Router, static export). The RGAA 5 sources live in `rgaa/content/` (markdown, edited by contributors) and `packages/content` reads and checks them; see `docs/rgaa5-integration.md`.

## Stack

- **Workspace:** pnpm workspaces, Turborepo, Node 22
- **Framework:** Next.js 16 (App Router + Pages Router hybrid), React 19
- **CMS:** Payload CMS 3 with Postgres (`@payloadcms/db-postgres`)
- **API:** tRPC 11 (`@trpc/server`, `@trpc/react-query`)
- **Auth:** better-auth
- **UI:** `@codegouvfr/react-dsfr` (French government design system), MUI, tss-react, Emotion
- **Forms:** `@tanstack/react-form`
- **Tables:** `@tanstack/react-table`
- **Validation:** Zod 4
- **Email:** React Email + Nodemailer
- **Tooling:** oxlint, oxfmt, lefthook, TypeScript 5.8

## Common commands

Run from the repo root; Turborepo fans them out to every workspace package.

- `pnpm dev` — start every app in dev mode (teleservice on :3000, site on :3001)
- `pnpm build` — production build of every package
- `pnpm run check` — lint + format check (oxlint + oxfmt), repo-wide
- `pnpm check:write` — lint fix + format write, repo-wide
- `pnpm typecheck` — `tsc --noEmit` in every package
- `pnpm test` — vitest in every package
- `pnpm --filter teleservice <script>` — run one app's script (`dev`, `payload`, `seed:dev`…)
- `pnpm --filter @rgaa/content check` — validate `rgaa/content/` (French messages, exit 1 on any problem)
- `docker compose up -d` — start Postgres and maildev

Lint and format config (`.oxlintrc.json`, `.oxfmtrc.json`, `lefthook.yml`) lives once at the root. Per-package tasks (`build`, `dev`, `typecheck`, `test`) are declared in `turbo.json`.

## Repo layout

```
apps/
├── site/          # public RGAA 5 site: App Router, `output: "export"`, no server
│   └── src/
│       ├── app/            # routes: /, /obligations, /methode, /rgaa/[referentiel]
│       ├── components/rgaa # header, hero, criteria accordions (client components, tss-react)
│       └── dsfr-bootstrap/ # react-dsfr App Router wiring (DsfrHead, DsfrProvider)
└── teleservice/   # the compliance application (own package.json, tsconfig, .env)
    ├── public/
    └── src/
        ├── app/         # Next.js App Router
        ├── pages/       # Next.js Pages Router (legacy/coexisting)
        ├── components/  # React components (ui/ generic, declaration/ domain-specific)
        ├── domain/      # Pure business logic: no React, no I/O (declaration/ registry, gate, state, snapshot)
        ├── forms/       # TanStack form definitions + Zod schemas
        ├── hooks/       # Generic, cross-cutting React hooks
        ├── lib/         # Infrastructure glue (tRPC client, auth, server guards)
        ├── server/      # tRPC routers + server logic
        ├── payload/     # Payload CMS config and collections
        ├── styles/      # Global styles
        └── tests/       # vitest, mirrors the layer under test
packages/
└── content/       # @rgaa/content: reads rgaa/content/, validates it (Zod), builds the published model
rgaa/
├── content/       # RGAA 5 sources: thematiques.yml, criteres/<n>/<referentiel>/, glossaire/
└── data/          # generated Données publiées, committed by CI (not yet produced)
docs/              # team documentation: ADRs, agent guides, RGAA 5 decisions
CONTEXT.md         # domain glossary
```

Paths in the guides below are relative to `apps/teleservice/` unless they start with `apps/`, `packages/` or `docs/`.

Both apps depend on the same `@codegouvfr/react-dsfr` copy; `react-dsfr update-icons` (each app's `predev`/`prebuild`) rewrites the shared icon CSS for the app it runs in. Building one app at a time is always correct; only `pnpm dev` with both apps running at once can leave one of them missing an icon until its own `predev` runs again.

## Code comments

Comment only to state a business rule or constraint the code cannot show. One line preferred, two max. Never cite ADRs or docs from code comments — discoverability flows docs→code. Never comment what changed, where something came from, or what the next line does.

## Agent skills

### Domain docs

Single-context repo. `CONTEXT.md` lives at the repo root; ADRs live in `docs/adr/`. See `docs/agents/domain.md`.

Before working on the declaration details page (sections, forms, autosave, publish gate), read the area map in `docs/agents/declaration-form.md` — it locates every seam so you open only the files the task touches.

ADRs hold the reasoning; guides hold the resulting rule. A guide may link an ADR where a rule would surprise, but never restates its trade-off analysis. Code never cites ADRs or docs.

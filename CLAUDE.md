# Téléservice Conformité

Next.js + Payload CMS + tRPC application for managing digital service compliance.

## Stack

- **Framework:** Next.js 16 (App Router + Pages Router hybrid), React 19
- **CMS:** Payload CMS 3 with Postgres (`@payloadcms/db-postgres`)
- **API:** tRPC 11 (`@trpc/server`, `@trpc/react-query`)
- **Auth:** better-auth
- **UI:** `@codegouvfr/react-dsfr` (French government design system), MUI, tss-react, Emotion
- **Forms:** `@tanstack/react-form`
- **Tables:** `@tanstack/react-table`
- **Validation:** Zod 4
- **Email:** React Email + Nodemailer
- **Tooling:** oxlint, oxfmt, lefthook, TypeScript 5.8, Yarn 1

## Common commands

- `yarn dev` — start Next.js dev server (turbo)
- `yarn build` — production build
- `yarn check` — lint + format check (oxlint + oxfmt)
- `yarn check:write` — lint fix + format write
- `yarn typecheck` — `tsc --noEmit`
- `docker compose up -d` — start Postgres and maildev

## Repo layout

```
src/
├── app/         # Next.js App Router
├── pages/       # Next.js Pages Router (legacy/coexisting)
├── components/  # React components (ui/ generic, declaration/ domain-specific)
├── domain/      # Pure business logic: no React, no I/O (declaration/ registry, gate, state, snapshot)
├── forms/       # TanStack form definitions + Zod schemas
├── hooks/       # Generic, cross-cutting React hooks
├── lib/         # Infrastructure glue (tRPC client, auth, server guards)
├── server/      # tRPC routers + server logic
├── payload/     # Payload CMS config and collections
└── styles/      # Global styles
```

## Code comments

Comment only to state a business rule or constraint the code cannot show. One line preferred, two max. Never cite ADRs or docs from code comments — discoverability flows docs→code. Never comment what changed, where something came from, or what the next line does.

## Agent skills

### Domain docs

Single-context repo. `CONTEXT.md` lives at the repo root; ADRs live in `docs/adr/`. See `docs/agents/domain.md`.

Before working on the declaration details page (sections, forms, autosave, publish gate), read the area map in `docs/agents/declaration-form.md` — it locates every seam so you open only the files the task touches.

ADRs hold the reasoning; guides hold the resulting rule. A guide may link an ADR where a rule would surprise, but never restates its trade-off analysis. Code never cites ADRs or docs.

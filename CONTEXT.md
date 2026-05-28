# Context — Téléservice Conformité

Domain glossary and shared vocabulary for this project. Skills like `/grill-with-docs`, `/diagnose`, `/tdd`, and `/improve-codebase-architecture` read this file before exploring the codebase, and use the terms defined here when naming things they produce.

This file starts mostly empty and is filled in lazily by `/grill-with-docs` as terms get pinned down during real work. Don't try to populate it speculatively.

## Glossary

### Declaration

The main entity of the application: an accessibility declaration ("déclaration d'accessibilité") for one digital service of one administration. Materialised by the `declarations` Payload collection.

A Declaration aggregates four pieces of content (its [[section]]s) plus identity fields (name, entity/administration, app_kind, url) and a publication lifecycle (see [[status]]).

**See also:** [[section]], [[status]], ADR-0001.

### Section

One of the four top-level content areas of a Declaration, surfaced as items in the declaration details page's `SideMenu`:

- **Informations générales** — meta-info about the service (slug `infos`)
- **Audit** — audit results (slug `audit`, has [[sub-section]]s)
- **Schéma et plans d'action** — multi-year accessibility plan (slug `schema`)
- **Contact** — contact method for accessibility issues (slug `contact`)

Each Section corresponds to its own Payload collection (`audits`, `schemas`, `contacts`) or, for Infos, to fields on `declarations` itself. The URL of the details page encodes the active Section as `?section=<slug>` — see ADR-0001.

**Avoid:** "block" — used colloquially in conversation but not in code. "Tab" — current code uses `Tabs` for Démarche/Membres at the parent level, which is unrelated to Section navigation.

**See also:** [[sub-section]], ADR-0001.

### Sub-section

One of the four children of the **Audit** Section, surfaced as nested items in the `SideMenu`:

- **Réalisation de l'audit** (slug `audit-realisation`) — `isAuditRealised`, date, RGAA version, realisedBy, rate, audit report file
- **Outils et environnements** (slug `audit-outils`) — usedTools + testEnvironments
- **Contenus vérifiés** (slug `audit-contenus`) — compliantElements
- **Non conformités & dérogations** (slug `audit-non-conformites`) — nonCompliantElements, disproportionnedCharge, optionalElements

All four Sub-sections persist into the single `audits` row for the Declaration. The slice-to-database mapping is a UI grouping, not a data split.

When `audit.isRealised === false`, only "Réalisation" is meaningful; the other three Sub-sections are hidden from the SideMenu and from Suivant/Retour navigation.

**See also:** [[section]], [[audit-realise]].

### Status

The Declaration's publication lifecycle. **Three visual states**, derived from **two database columns**:

| Visual state  | `status`        | `publishedContent`               |
| ------------- | --------------- | -------------------------------- |
| **Brouillon** | `"unpublished"` | empty/null                       |
| **Modifiée**  | `"unpublished"` | non-empty (was published before) |
| **Publiée**   | `"published"`   | non-empty                        |

`publishedContent` holds the snapshot of the declaration as it appeared when last published. Its presence is what distinguishes a fresh draft from a modified-since-publish declaration.

Transitions:

- `Brouillon` → **publish action** → `Publiée` (sets `status`, `published_at`, `publishedContent`)
- `Publiée` → **edit any Section** → `Modifiée` (sets `status="unpublished"`, keeps `publishedContent`)
- `Modifiée` → **publish action** → `Publiée`
- `Modifiée` → **`revertToPublished`** → `Publiée` (restores Section content from `publishedContent`)

**Avoid:** "Draft" (use "Brouillon"), "Dirty" (use "Modifiée"). UI badge labels live in `DeclarationStatusBadge`.

### Audit réalisé

The `isAuditRealised` boolean on `audits`. When `false`, the audit row exists but the declarant has stated no audit was actually performed — the rest of the audit fields are not collected. When `true`, the four Audit [[sub-section]]s become applicable.

**See also:** [[sub-section]].

### À compléter / À vérifier

Two status badges shown on `SideMenu` items (and historically on the Démarche page tiles):

- **À compléter** — the Section's data is missing (e.g. `!declaration.contact`). For Audit Sub-sections, computed per-slice (e.g. `audit.usedTools?.length === 0` for Outils).
- **À vérifier** — the Section's `toVerify` flag is `true`, set when content was AI-generated and needs human review. Tracked at Section level only; not fanned out to Sub-sections.

**Avoid:** "À remplir" — older copy, replaced by "À compléter."

### Surfaces

A Declaration is reached through two distinct route trees, kept separate on purpose:

- **Dashboard editor** — `/dashboard/declarations/[id]` (authenticated). The editing surface: SideMenu, [[section]]s, status actions, Membres.
- **Public published view** — `/declarations/[id]/publish` (no auth). Read-only render of `publishedContent` via `PublishedDeclarationTemplate`.

Both trees use the **plural** `declarations/` segment. Singular `declaration/` is not used as a route segment.

## Code structure & naming

Layered, not feature-foldered. One predictable layer per concern:

- `components/ui/` — generic, domain-free UI (primitives + cross-cutting pieces like EmptyState, HelpingMessage).
- `components/declaration/` — declaration-specific UI only (e.g. the `sections/` tree).
- `lib/` — infrastructure glue (api/tRPC client, auth, server guards).
- `hooks/` — generic, cross-cutting hooks only; domain hooks colocate in `domain/`.
- `forms/` — TanStack form definitions + Zod schemas (cross-cutting layer).
- `server/api/` — tRPC routers; `pages/` — Next.js routes; `emails/` — React Email templates.

**Naming convention:** the folder is the namespace; files drop the redundant prefix (`sections/Shell.tsx`, not `DeclarationSectionShell.tsx`). Keep a prefix only when a bare name would collide or be ambiguous across folders (e.g. greppable `auditSchema.ts` rather than a fourth `schema.ts`). _Avoid_: "utils" as a catch-all bucket — every file belongs to a named layer above.

## Invariants

- A Declaration's visible status is a pure function of `status` + `publishedContent`. Don't introduce a third source of truth.
- The Audit collection has at most one row per Declaration. The four Audit [[sub-section]]s are UI groupings over that single row; they never produce separate rows.
- When `audit.isRealised === false`, fields belonging to the three non-Réalisation Sub-sections are not required and should not be surfaced for editing.
- `toVerify` is per-Section, not per-Sub-section.

## Out of scope

- **"Block"** — conversational synonym for Section. Never used as a code identifier.
- **"Wizard step" / `MultiStep`** — the audit's previous step-by-step entry flow. Retired with ADR-0001; the `MultiStep` component may still exist for legacy reasons but is no longer referenced by the audit Section.

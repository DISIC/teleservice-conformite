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
- **Audit** — audit results; has no slug of its own — it is a menu-only virtual parent (`SectionParentKey`) reached via its first [[sub-section]] (`audit-general`)
- **Schéma et plans d'action** — multi-year accessibility plan (slug `schema`)
- **Contact** — contact method for accessibility issues (slug `contact`)

Each Section corresponds to its own Payload collection (`audits`, `schemas`, `contacts`) or, for Infos, to fields on `declarations` itself. The URL of the details page encodes the active Section as `?section=<slug>` — see ADR-0001.

**Avoid:** "block" — used colloquially in conversation but not in code. "Tab" — current code uses `Tabs` for Démarche/Membres at the parent level, which is unrelated to Section navigation.

**See also:** [[sub-section]], ADR-0001.

### Sub-section

One of the four children of the **Audit** Section, surfaced as nested items in the `SideMenu`:

- **Réalisation de l'audit** (slug `audit-general`) — `isAuditRealised`, date, RGAA version, realisedBy, rate
- **Outils et environnements** (slug `audit-outils`) — usedTools + testEnvironments
- **Contenus vérifiés** (slug `audit-contenus`) — compliantElements
- **Non conformités & dérogations** (slug `audit-non-conformites`) — nonCompliantElements, disproportionnedCharge, optionalElements

A Sub-section is a **URL-addressable, independently-saved slice** of the Audit Section: each has its own `?section=<slug>` destination, its own self-contained form, and saves on its own (ADR-0002). It is _not_ a top-level [[section]] — "Audit" is a menu-only **virtual parent** (`SectionParentKey`), reached via `audit-general`; the four Sub-sections are its nested `SideMenu` children, treated in code as ordinary `SectionMeta` carrying `parent: "audit"`.

What makes a Sub-section distinct from a Section is the **data asymmetry**: all four Sub-sections persist into the **single** `audits` row for the Declaration — they are UI slices over one row, never separate rows (see Invariants). The other Sections (Infos/Schéma/Contact) each map to their own entity.

Note: the Sub-section _level_ is the navigational + data grouping described here; it is independent of how the forms are built. ADR-0002 retired the single multi-step audit form in favour of four independent forms — that changed the **form**, not the existence of the Sub-section level. Each Sub-section's body is laid out as one or more [[part]]s.

When `audit.isRealised === false`, only "Réalisation de l'audit" is meaningful; the other three Sub-sections stay visible in the `SideMenu` but display a notice instead of their form (no editable fields or actions) until the audit is marked realised.

**See also:** [[section]], [[part]], [[audit-realise]].

### Part

A titled grouping of one or more related fields **inside** a [[sub-section]]'s body. A Sub-section contains one or more Parts; each Part has its own heading and is visually a self-contained bordered card.

Examples: the **Outils et environnements** Sub-section has two Parts — "Outils d'assistances" (`usedTools`) and "Environnements de tests" (`testEnvironments`). **Non conformités & dérogations** has two Parts — "Non conformités" (`nonCompliantElements`) and "Dérogations" (`optionalElements` + `disproportionnedCharge`). Single-Part Sub-sections (e.g. **Contenus vérifiés**) have exactly one Part.

**Avoid:** "block" (conversational only, see Out of scope), "section/sub-section" (reserved for the two higher levels).

**See also:** [[sub-section]].

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
- `hooks/` — generic, cross-cutting hooks only.
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

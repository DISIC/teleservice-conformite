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

Every Section's content lives on the `declarations` row itself: Infos as top-level fields, Audit/Schéma/Contact as group fields (ADR-0004). Contact and Schéma may additionally reference a [[library|Library]] parent. The URL of the details page encodes the active Section as `?section=<slug>` — see ADR-0001.

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

### Editing mode (sequential / standalone)

How the declaration details page presents its [[section]]s for editing. Derived from [[status]], but a distinct concept — it describes _interaction_, not lifecycle.

- **Sequential** — used while the Declaration is **Brouillon** (never published). The [[section]]s are chained into one guided walkthrough: every section renders permanently editable (no read-only toggle, no per-section Modifier/Annuler/Enregistrer), and the footer commits the current section and advances — "Enregistrer et suivant". The final section (Contact) ends the walkthrough with a completeness gate ("Prévisualiser et publier") that validates _all_ sections against their schemas and surfaces a single, live, page-level error summary.
- **Standalone** — used once the Declaration has been published (**Modifiée** or **Publiée**). Each [[section]] is edited on its own via its top-right Modifier → Annuler/Enregistrer toggle, independent of the others (the ADR-0002 model). Footer navigation is plain section-to-section movement.

The two modes select different behaviors of the same `sections/Shell`; the active mode is decided once per page load from `status === "Brouillon"`.

**Distinct from the "nothing to save" signal:** mode answers "how does the whole declaration get edited"; the per-section `hideActions` flag is an orthogonal signal for "this particular section has nothing to save" (e.g. an audit notice when the audit isn't realised). The two compose — a nothing-to-save section in sequential mode still just advances.

**Avoid:** "Wizard" — collides with the retired `MultiStep` audit flow (see Out of scope). "Fill mode" — superseded by "sequential".

### Audit réalisé

The `isAuditRealised` boolean on the Declaration's `audit` group. When `false`, the declarant has stated no audit was actually performed — the rest of the audit fields are not collected. When `true`, the four Audit [[sub-section]]s become applicable.

**See also:** [[sub-section]].

### À compléter / À vérifier

Status badges shown on `SideMenu` items (and historically on the Démarche page tiles):

- **À compléter** — the Section's data is missing (e.g. `!declaration.contact`). For Audit Sub-sections, computed per-slice (e.g. `audit.usedTools?.length === 0` for Outils).
- **À vérifier** — the Section's `toVerify` flag is `true`, set when content was AI-generated and needs human review. Tracked at Section level only; not fanned out to Sub-sections.
- **Modifié** — _(future)_ a Section changed since the last publish. The badge **variant** exists in `SECTION_BADGE` but the per-section diff against `publishedContent` is not yet implemented; only [[declaration-state|Declaration state]] currently surfaces "Modifié", at the declaration level.

**Single source of presentation:** which sections get a badge is decided by the per-section checks (`isSectionToComplete` / `isSectionToVerify`), but the badge **label + colours** are not defined here. They come from `SECTION_BADGE` in `state.ts` — a subset of `STATE_PRESENTATION` that references the existing `.badge` objects of the matching [[declaration-state|Declaration state]] (`to-complete`→`incomplete`, `to-verify`→`to-verify`, `modified`→`published-modified`). This keeps the SideMenu badges and the StateNotice card visually identical (same decision-token colours, same copy) with one source of truth. The per-section badge presentation is _not_ the same axis as `DeclarationState` itself (which is one declaration-wide value); only the presentation triple is shared.

**Avoid:** "À remplir" — older copy, replaced by "À compléter."

### Declaration state

A **derived, presentation-facing** state answering _"what should the declarant do next?"_, surfaced as a single notice card at the top of the [[dashboard editor|Surfaces]]. Distinct from [[status]]: where `Status` is the pure 3-state lifecycle (two DB columns), `DeclarationState` is a **richer** value that folds completeness and AI-verification on top of the lifecycle. The two are not the same axis and must not be conflated.

Computed by `getDeclarationState(declaration)` as a switch on [[status]], with the editable branches sub-split by completeness:

| `DeclarationState`     | Reached when                                            | Maps to [[status]] |
| ---------------------- | ------------------------------------------------------- | ------------------ |
| `incomplete`           | draft **and** `validateDeclaration()` returns errors    | Brouillon          |
| `to-verify`            | draft, complete, has unverified AI content (`toVerify`) | Brouillon          |
| `ready`                | draft, complete, no AI flag                             | Brouillon          |
| `published-incomplete` | modified **and** `validateDeclaration()` returns errors | Modifiée           |
| `published-modified`   | modified, complete                                      | Modifiée           |
| `null` (no notice)     | clean published, unchanged                              | Publiée            |

**Key rule (v2):** the lifecycle decides first (Brouillon / Modifiée / Publiée), then completeness and AI-verification sub-split the editable branches **symmetrically**. A published Declaration **can** become incomplete — removing its Contact or Schema moves it to Modifiée with that Section flagged À compléter (`published-incomplete`), and publishing is blocked until completed. The public snapshot is unaffected. _(Supersedes the retired v1 rule "incomplete is Brouillon-only".)_

`to-verify` becomes reachable once the import [[creation-path|Creation paths]] (ARA / IA) land — they create Declarations with `toVerify` Sections.

Does **not** violate the "visible status is a pure function of two columns" Invariant: that invariant governs `Status`, which is unchanged. `DeclarationState` is a separate concept layered above it.

**Avoid:** "StateDeclaration" (reversed word order), "Readiness" (rejected name), reusing "Status" for this — they are different concepts.

**See also:** [[status]], [[à-compléter-à-vérifier|À compléter / À vérifier]].

### Creation path

One of the three ways a Declaration comes into existence, chosen by the declarant on the creation page (`/dashboard/form`):

- **Manuel** (`fromSource: "manual"`) — declarant supplies only a name; a skeleton Declaration is created and completed via the **sequential** [[editing mode|Editing mode]].
- **Import ARA** (`fromSource: "ara"`) — declarant supplies the URL of an ARA report; its data is fetched from ARA's API and the Declaration is created pre-filled.
- **Import IA** (`fromSource: "ai"`) — declarant supplies the URL of an already-published accessibility declaration page; an LLM (Albert) extracts its content and the Declaration is created pre-filled.

The two **import paths** share one contract: both sources normalize into a single imported-data shape, the Declaration is created entirely server-side in one mutation, and the imported Sections are flagged **À vérifier** ([[à-compléter-à-vérifier|À compléter / À vérifier]]). On failure nothing is created; the declarant is offered the Manuel path as fallback. The imported name falls back to the submitted URL's hostname when the source provides none — a Declaration is never created nameless.

The ARA import is intended to be reusable later as an **update** of an existing (published) Declaration's audit from a fresh ARA report — same fetch + normalize + transform, update instead of create.

**Avoid:** "contextForm" — legacy name for the creation page's form, retired with the per-path split.

**See also:** [[status]], [[à-compléter-à-vérifier|À compléter / À vérifier]].

### Library ("Schémas et Contacts")

A user's personal pool of Contacts and Schemas, reusable across their Declarations. Ownership is **per-user**, not per-entity/organization (organization-level sharing is out of scope).

A Declaration's contact/schema is sourced in one of these **modes**, chosen explicitly via a [[source mode]] radio in the section form:

- **Linked** — the Declaration references a Library parent (an object created/managed in the "Schémas et Contacts" area). It holds its **own copy** of the parent's content, but the copy mirrors the parent: while linked, the data renders **read-only** in the Declaration form, and editing the parent (only possible from the Library area) **auto-propagates** to every linked copy. If propagation touches published Declarations, a warning modal lists them before saving (they move to Modifiée and need republishing — the public snapshot never moves on its own).
- **Custom** — the declarant flips the custom switch and writes the object inline. It belongs to that Declaration alone: editable in place, no parent, no propagation in or out.
- **Skipped** _(schema only)_ — the declarant declares "no schema" deliberately. Contact has no Skipped mode; a Contact is always required to publish.

The section-form dropdown offers **both**: Library parents _and_ custom objects from the user's other Declarations. Selecting a parent establishes a **link**; selecting another Declaration's custom object only **pre-fills** a new custom copy — later changes to the source flow nowhere.

Lifecycle rules:

- **Deleting** a Library parent never affects Declarations — their copies survive, detached (they become custom). Published content is immutable to Library operations.
- Removing a contact or schema **from a published Declaration itself** moves it to Modifiée with that section flagged À compléter; the public snapshot is unchanged.

**Avoid:** "shared documents" / entity-level sharing — the retired model where Contacts/Schemas were linked to an `entity`. "Pre-fill" for the linked mode — pre-fill is the copy-without-link gesture, linking is more than pre-fill.

**See also:** [[section]], [[status]], [[source mode]].

### Source mode

The declarant's explicit choice, per Contact/Schema [[section]], of where that section's content comes from — surfaced as a `RichRadioField` (the same control as `app_kind`). Options: **Linked** / **Custom** for both; **Skipped** for schema only (see [[library|Library]]).

The selected option is **derived from persisted state**, not stored as its own field: `parent` set → Linked; content present, no parent → Custom; (schema) `skipped` flag → Skipped; everything empty and no parent → **Undecided** (no option pre-selected). The radio is hidden entirely when the user's Library holds no item of that kind — the section collapses to a bare editable Custom form.

**Undecided blocks publish.** [[à-compléter-à-vérifier|Completeness]] is no longer the only schema gate: choosing a Source mode is itself required. While Undecided, `validateDeclaration` emits one error targeting the radio ("select an option"), so the [[à-compléter-à-vérifier|error summary]] pushes the declarant to decide — including the deliberate Skipped choice for schema. Once content exists (Custom intent), the usual field-level validation takes over.

**Avoid:** "toggle"/"switch" — the retired two-state custom switch; this is an N-way radio. "skip" as a verb on contact — contact cannot be skipped.

**See also:** [[library|Library]], [[à-compléter-à-vérifier|À compléter / À vérifier]].

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
- A Declaration has exactly one audit — the `audit` group on its row (structural since ADR-0004; v1's "at most one `audits` row" invariant is subsumed). The four Audit [[sub-section]]s are UI groupings over that single group.
- When `audit.isRealised === false`, fields belonging to the three non-Réalisation Sub-sections are not required and should not be surfaced for editing.
- `toVerify` is per-Section, not per-Sub-section.
- A **linked** contact/schema copy is written only by the Library propagation procedure — never directly by a Declaration save. Custom copies are written only by their own Declaration.
- **Publish always validates.** The publish CTA runs full declaration validation regardless of lifecycle state — there is no fast path. (Supersedes the retired v1 invariant "published-modified is always publishable": removing a Contact/Schema from a published Declaration can make it incomplete, so completeness is no longer guaranteed by per-section save gating. See [[declaration-state|Declaration state]].)
- Contact and Schema are **symmetric** in flows and business logic: anything defined for one (Library behaviour, removal from a Declaration, À compléter flagging) applies identically to the other.

## Out of scope

- **"Block"** — conversational synonym for Section. Never used as a code identifier.
- **"Wizard step" / `MultiStep`** — the audit's previous step-by-step entry flow. Retired with ADR-0001; the `MultiStep` component may still exist for legacy reasons but is no longer referenced by the audit Section.
- **Entity-level sharing of Contacts/Schemas** — retired in the v2 redesign in favour of the per-user [[library|Library]]. The `entity` link on `contacts`/`schemas` no longer carries sharing semantics.

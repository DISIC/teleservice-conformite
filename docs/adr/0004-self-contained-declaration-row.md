# ADR-0004: Self-contained Declaration row + per-user Library

- **Status:** Accepted
- **Date:** 2026-06-10
- **Amends:** ADR-0002 (persistence target), ADR-0003 (gate scope)

## Context

A Declaration's content is currently spread across four collections: `declarations` plus a 1:1 `audits` row (join field) and optional `contacts` / `schemas` rows (relationships). `contacts`/`schemas` were separate collections to support **entity-level sharing** — a contact linked to an `entity` could be reused across that administration's declarations via `linkExisting`.

The v2 redesign retires entity-level sharing. The product direction (client, June 2026) is a **per-user Library** ("Schémas et Contacts"): a user's own pool of contacts and schemas, reusable across _their_ declarations with two sourcing modes — **linked** (live reference to a Library parent: read-only in the declaration, parent edits auto-propagate) and **custom** (declaration-local object, editable inline, no propagation). Deleting a Library parent must never affect declarations; their content survives, detached. Historic data does not need to be migrated.

With sharing gone from the declaration side, the relational split is pure overhead. This ADR decides the storage shape for v2.

## Decision

**One `declarations` row carries the whole declaration content. `contacts` and `schemas` become Library-only collections. `audits` is deleted.**

- `declarations` gains three **group fields**:
  - `audit` — all audit fields folded in (it was always strictly 1:1; nothing ever shares an audit).
  - `contact` — the declaration's own copy: `name`, `email`, `url`, plus a nested **`parent`** relationship → `contacts` (so access reads `contact.parent`, not a verbose `contactParent`).
  - `schema` — the declaration's own copy: `name`, `url`, `actionPlanUrls`, plus a nested **`parent`** relationship → `schemas`.
- **Linked mode** = `parent` set; the group's content is a mirror of the parent, rendered read-only in the declaration form. **Custom mode** = `parent` null; the group is editable inline.
- `contacts` / `schemas` rows exist **only** as Library parents, owned by a `user` relationship (replacing `entity`). They are edited only through the Library area's update procedure, which **fans out**: write the parent, then update the copy in every linked declaration in one transaction; published declarations flip to Modifiée (warning modal lists them first). The public snapshot (`publishedContent`) never moves on its own.
- Deleting a parent nulls the `parent` references and leaves the copies untouched — detach-on-delete is **structural**, not hook-enforced.
- Validation, the publish snapshot, and the section `fromDeclaration` mappers all read the single row. The publish gate (`validateDeclaration`) runs on **every** publish, regardless of lifecycle state (amends ADR-0003 — the published-modified fast path is retired, because removing a contact/schema from a published declaration can now make it incomplete).
- The four independent audit Sub-section forms (ADR-0002) are kept as-is; their upsert simply patches the `audit` group on `declarations` instead of an `audits` row (amends ADR-0002's persistence target only).

## Current vs new architecture — honest comparison

Not change for its own sake; here is what each shape actually costs and buys.

### Current (4 collections, relationships + joins)

**Pros:**

- Idiomatic relational normalization; entity-level sharing was free (point two declarations at one row).
- Per-section tables make per-section access control or per-section querying trivial at the DB level.
- Smaller row writes: saving the audit touches only the `audits` table.
- No fan-out: a shared object's edit is one row write, visible everywhere by reference.

**Cons:**

- Reading a declaration requires populating 3 relationships/joins (`PopulatedDeclaration`); every consumer (validation, snapshot, mappers, UI) handles partially-populated or missing relations (`number | Contact` unions in generated types).
- Lifecycle is hook-glued: cascade-delete hook with entity-sharing checks, "at most one audit row per declaration" enforced in the service layer rather than by structure, create-then-link two-step on first save of each section.
- Three divergent upsert patterns (audit lenient-partial vs contact/schema full-or-link) — three shapes for one concept, a real comprehension tax for humans and agents.
- Empty-vs-absent ambiguity: a section can be "no row yet", "row with empty fields", or "row with nulls" — three encodings of "not filled in".
- Sharing-by-reference means editing a contact can silently change another **published** declaration's working content — the exact failure mode the new copy model exists to prevent.

### New (self-contained row + Library)

**Pros:**

- A declaration is **one read, one shape** — the row mirrors the Section tree in CONTEXT.md. `PopulatedDeclaration`, join hydration, and relation unions disappear from the main path.
- Invariants become structural: exactly one audit per declaration (it's a group), copies survive parent deletion (they're already local), sections always exist (just empty) — no cascade hook, no service-layer uniqueness guard.
- One save pattern everywhere: every section save is "patch fields on the declarations row"; the only extra gesture is link/unlink of a parent.
- Publish snapshot and `validateDeclaration` read the same single object the forms write — no mapper layer reconciling row shapes.
- Custom objects need no collection at all; the Library dropdown is two cheap queries (parents by owner + customs projected from the user's declarations).

**Cons / costs accepted:**

- **Fan-out writes**: editing a Library parent updates N declaration rows in a transaction instead of one shared row. Fine at this scale (a user's declarations, single digits–dozens); would need rework at thousands of links per parent.
- **Copy divergence is possible by construction**: a bug in the propagation procedure can leave a linked copy differing from its parent. Mitigation: linked copies are read-only in the UI and writable only by the propagation procedure.
- Wide `declarations` table (~25 columns vs 4 narrow tables). Postgres is indifferent; Payload admin UI for the row gets long.
- Per-section DB-level querying (e.g. "all audits with rate < 50") becomes a query on declaration columns — actually simpler, but different from today.
- A drop-and-recreate migration: acceptable now ("we don't care about historic data"), would not be later. This is the hard-to-reverse part.

**Net:** the current shape pays a permanent comprehension and glue-code tax to keep a sharing capability that the product has now redefined as copy-based. Once sharing is copy-with-propagation, references buy nothing on the declaration side — the single-row shape makes the documented invariants true by construction instead of by hooks.

## Consequences

**Easier:**

- `validateDeclaration`, `extractDeclarationContentToPublish`, `revertToPublished`, and every `fromDeclaration` mapper operate on one self-describing row.
- The three sub-routers (`audit`, `contact`, `schema`) converge on one save shape; `linkExisting` and the cascade-delete hook are deleted.
- The À compléter badges and `DeclarationState` read local fields, not relation presence.

**Harder / committed to:**

- A new **Library router** owns parent CRUD + propagation (fan-out transaction, Modifiée flips, warning-modal pre-check endpoint "which published declarations link this parent?").
- Linked-copy integrity rests on a single choke point: nothing but the propagation procedure may write a linked group. Reviewers must hold that line.
- Full regeneration of Payload types and a destructive migration; `publishedContent` shape changes accordingly.

## Alternatives considered

- **Keep 4 collections, just move `entity` → `user` on contacts/schemas.** Minimal diff, but keeps reference semantics — editing a shared row mutates other declarations' working content directly, contradicting the copy-at-T model the client specified (copies must survive parent deletion; published declarations must be insulated). Also keeps all the populate/cascade/upsert-divergence overhead. Rejected.
- **Pure copy, no parent reference (dumb pre-fill everywhere).** Simplest possible model, but loses the linked mode the client explicitly asked for (edit in Library → applies on the fly to linked declarations). Rejected.
- **Copies as rows in `contacts`/`schemas` with a `declaration` owner (one collection, two row species).** Avoids group fields but reintroduces populate-on-read, keeps empty-vs-absent ambiguity, and makes "Library list" queries filter species forever. Rejected.
- **JSON column for the copies.** Schema-less copies inside the row. Rejected: loses Payload field validation/typing and the admin UI for no benefit over group fields.

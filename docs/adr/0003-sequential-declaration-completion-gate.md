# ADR-0003: Sequential completion mode + declaration-wide validation gate

- **Status:** Accepted — partly superseded by ADR-0006
- **Date:** 2026-06-09 (gate scope widened 2026-06-10, ADR-0004; gate predicate extended 2026-06-14, ADR-0005; save-on-advance + per-section save validation retired 2026-06-18, ADR-0006; gate enforcement moved server-side 2026-07-02)

> **Superseded in part (ADR-0006, 2026-06-18):** sequential mode no longer commits-and-advances ("Enregistrer et suivant") or validates per section on save. Edits **autosave** as they happen, the footer is plain "Suivant", and the declaration-wide gate is the only completeness check. The **mode split** (sequential vs. standalone) and the **gate** itself (described below) are unchanged; ignore the "Enregistrer et suivant" footer behavior and the "second validation entry point" consequence — see ADR-0006.

> Two later refinements are folded into the body below so it reads as the current gate:
>
> - **Scope (ADR-0004):** the gate is **universal** — `validateDeclaration` runs on every publish, including from Modifiée. There is no "published-modified is always publishable" fast path: removing a contact/schema from a published Declaration leaves it incomplete (`published-incomplete`).
> - **Predicate (ADR-0005):** "complete" is no longer only "every section's Zod schema passes." For the Contact/Schema [[section|sections]] the declarant must also have **chosen a [[source mode]]** (Linked / Custom / Skipped); an Undecided section emits a gate error targeting the radio. This error is produced **outside** the per-field `runSchema` path.
> - **Enforcement (2026-07-02):** the gate runs **server-side** — the `declaration.publish` mutation itself validates the declaration and builds the published snapshot; the client sends only an id and can no longer supply `publishedContent`. The client CTA (ADR-0006 flow) remains the UX layer on top. Gate failure surfaces as an opaque `PRECONDITION_FAILED` without the error list: the details page's error summary recomputes field-level errors client-side from fresh data, so transporting them from the server would only duplicate a staler copy.
>
> The sequential/standalone mode split is unaffected by either.

## Context

Until now the declaration details page offered a single editing experience: each [[section]] toggles between read-only and edit via its own top-right Modifier → Annuler/Enregistrer, saving independently (ADR-0001, ADR-0002). This fits a declaration that already exists and is being maintained.

But a brand-new declaration — **Brouillon**, never published (`status === "unpublished"` and no `publishedContent`, see [[status]]) — has nothing filled in yet. Asking the declarant to discover each section, click Modifier, fill, Enregistrer, then hunt for the next one is a poor first-run experience. The desired flow for a fresh declaration is a guided walkthrough: every section editable in place, a footer that commits the current section and advances, and at the end a single action that checks the whole declaration is complete before sending the declarant to preview/publish.

This raises two coupled questions:

1. **How to model the two experiences** without forking the section components or overloading the existing per-section "nothing to save" flag (`hideActions`, built for the audit notice — an orthogonal concern).
2. **How to validate completeness of the _whole_ declaration** at the end of the walkthrough, when only **one section is mounted at a time** (keyed `Fragment` in `Content.tsx`, ADR-0001). The other sections' TanStack form instances do not exist in the DOM, so we cannot ask them "are you valid?".

The codebase already carries coarse per-section completeness predicates — `isToComplete` in `sections.ts` — that drive the "À compléter" SideMenu badges. The natural question was whether those suffice as the gate.

## Decision

**Introduce an explicit editing mode and a declaration-wide validation gate, both keyed off Brouillon.**

- **`mode: "sequential" | "standalone"`** — a single prop, decided once per page load from `status === "Brouillon"`, threaded `index → SectionContent → section → Shell`. `sequential` for Brouillon; `standalone` (today's behavior, unchanged) for Modifiée/Publiée. It is **not** an overload of `hideActions`; the two are orthogonal and compose (a nothing-to-save notice section in sequential mode degrades its footer to plain "Suivant"). See the **Editing mode** glossary entry.
  - In `sequential`: no per-section top-right actions, `readOnly` forced `false` (every section permanently editable), and the footer "Suivant" becomes **"Enregistrer et suivant"** — an action button that runs the section's `handleSubmit` and, on save success, navigates to the next section. Navigation lives in `onSubmit`'s success path, so both validation _and_ save errors block it. "Précédent" stays plain back-navigation.

- **Declaration-wide gate via the real section schemas.** The last section (Contact) ends with **"Prévisualiser et publier"**: it saves Contact, then runs `validateDeclaration(declaration)` — which runs **every section's Zod schema against the persisted `declaration` data** (not against form instances), skipping non-applicable slices (the non-realised audit Sub-sections, per the existing Invariant). It returns a flat, ordered list of `{ section, field, message }`. Clean → navigate to preview. Errors → redirect to the first errored section (visible-section order, then schema field order) and surface a **live, page-level error summary**.
  - The summary lives in `index.tsx` state, gated by a "publish attempted" flag (so it appears only after the first click and clears on reload / leaving the page). It is **re-derived from `declaration` on every save** — as the declarant fixes and saves sections the list shrinks and auto-dismisses at zero. Fixed height, 3 field-level rows max with "Voir plus" (internal scroll/expand), rows clickable to their section.

- **Reusing the schemas requires extracting `declaration → formValues` mappers.** Each section currently builds its form's `defaultValues` inline (e.g. `InfosSection` maps `declaration` → `{ general: {...} }`). To validate outside the mounted component, those mappings move into reusable per-section functions that `validateDeclaration` and the components share.

## Consequences

**Easier:**

- The two experiences share one `sections/Shell` and one set of section components; the difference is a single `mode` prop, not a forked tree.
- The gate reports **field-level** errors (which the designer's "3 + Voir plus" summary needs), not just "section X is incomplete".
- `validateDeclaration` reuses the exact schemas each form already validates against — no second, drifting definition of "required".
- The error summary is a pure function of `declaration` + a boolean flag; live-shrinking and auto-dismiss fall out for free.

**Harder / committed to:**

- A **second validation entry point** now exists: per-section (on each "Enregistrer et suivant", against form state) and declaration-wide (the gate, against persisted data). A reader must understand these run at different times against different inputs but the _same_ schemas.
- The per-section `defaultValues` mappers must be **extracted and kept in sync** with their schemas; a mapper that drifts from its schema silently weakens the gate.
- Applicability rules (which sections the gate skips) must mirror the `isVisible` / `audit.isRealised` logic, or the gate will demand fields for non-applicable slices.
- Section `onSubmit` callbacks now branch on mode (exit-edit in standalone vs. navigate in sequential).

## Alternatives considered

- **Overload `hideActions` for the new mode.** **Rejected:** `hideActions` means "this section has nothing to save, keep nav enabled" — almost the inverse of sequential mode (everything to save, footer drives the save). Only one of its behaviors (hide top-right actions) overlaps. Overloading a flag whose name asserts the opposite is exactly the kind of conflation the glossary guards against; the two concepts stay separate and compose.

- **Gate on the coarse `isToComplete` predicates** (the "À compléter" badges). **Rejected:** they are section-level booleans (`!d.contact`, `audit.usedTools?.length === 0`), so they can answer "is this section incomplete" but cannot produce the field-level error list the summary requires. Keeping them as the cheap SideMenu signal while the gate uses the real schemas avoids a coarse/fine mismatch driving a precise UI.

- **Validate live form instances instead of persisted data.** **Rejected:** only one section is mounted at a time (ADR-0001's keyed `Fragment`); the other sections' forms do not exist when the gate runs. Mounting all sections at once to validate them would undo ADR-0001's one-section-per-route model.

- **A dedicated multi-step wizard component** separate from the section tree. **Rejected:** it would duplicate every section's form and reintroduce the multi-step shape ADR-0001/0002 deliberately retired (`MultiStep`). The `mode` prop reuses the existing components instead. (Note: the new mode is named **sequential**, not "wizard", precisely to avoid colliding with that retired concept.)

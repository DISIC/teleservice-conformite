# ADR-0005: Source mode — explicit Linked/Custom/Skipped choice, gated at publish

- **Status:** Accepted
- **Date:** 2026-06-15
- **Extends:** ADR-0003 (gate predicate), ADR-0004 (Library sourcing modes)

## Context

ADR-0004 gave each Declaration a self-contained `contact` / `schema` group with a nested `parent` relationship: `parent` set = **Linked** (read-only mirror of a Library item), `parent` null = **Custom** (editable inline). The form surfaced this with a `LibraryPickerSlot` — a strip above an always-visible form that showed either a "this comes from your Library / Détacher" notice (linked) or a `<Select>` of Library parents (custom), and rendered nothing when the user's Library was empty.

Three problems pushed a redesign:

1. **The sourcing choice was implicit.** Whether a section was Custom or Linked fell out of side effects (typing in the form, picking from a dropdown), never a deliberate choice. The product wants the declarant to _decide_ "from my Library" vs "just for this declaration" up front — the same `RichRadioField` pattern already used for `app_kind`.

2. **Schema is optional but had no way to say so.** A prior change removed schema's "À compléter" badge (`isToComplete: () => false`), but the publish gate still ran `schemaForm` (which requires `name`) against every section, so an empty schema **failed** `validateDeclaration` with "Le nom du schéma est requis". Schema was effectively still mandatory — there was no way to publish a declaration that legitimately has no multi-year scheme. Many declarants have none, and must not be blocked.

3. **Contact and Schema sections were duplicated twins** — each re-wiring the picker, the section frame, the mutation, and its inner form — with the only real differences being the Zod schema, the inner fields, and (now) whether "skip" is offered.

## Decision

**Model the sourcing choice as an explicit [[source mode]] `RichRadioField`, derive its value from persisted state, make choosing a mode a publish-gate requirement, and add a deliberate Skipped mode for schema only.**

- **Options.** Contact: **Linked** / **Custom**. Schema: **Linked** / **Custom** / **Skipped** ("Aucun schéma"). The Linked option is shown only when the user's Library holds an item of that kind; with an empty Library the radio is hidden entirely and the section collapses to a bare editable Custom form.

- **Derived, not persisted.** The selected option is computed from existing fields — no new `mode` enum:
  - `parent` set → **Linked**
  - `schema.skipped === true` → **Skipped**
  - content present, no parent → **Custom**
  - everything empty, no parent, not skipped → **Undecided** (no radio pre-selected)

  The only new persisted field is a boolean **`skipped`** on the `schema` group. A persisted `mode` enum was rejected (below) to avoid a second source of truth that can disagree with `parent`/`skipped`/content.

- **Undecided blocks publish, via a radio-targeted error.** "Complete" now means _both_ the section's Zod schema passes _and_ a source mode was chosen. While a section is Undecided, `validateDeclaration` emits one `DeclarationError` whose `field` is the radio's input `name` (so the existing `?field=` focus and the error summary route to it) and whose message asks the declarant to choose an option. Because "no mode chosen" is a section-level condition — not a missing field — this error is produced **outside** `runSchema`; once content exists (Custom intent) the usual per-field validation takes over. This is the ADR-0003 gate-predicate extension.

- **Skip is a user-controlled applicability escape.** Schema's section validation gains `isApplicable: (d) => d.schema?.skipped !== true`. When skipped, the schema schema is not run and the gate passes. This is unlike the only prior `isApplicable` (non-realised audit Sub-sections), which is **data-derived** from `isRealised`; skip is the declarant's explicit decision. The public view already renders an empty schema as "no schema links" (`showSchemaLinks === false`), so Skipped needs no published-view work — and because skipping clears the schema content, `recalculateDeclarationStatus`'s snapshot diff catches a published declaration moving to Skipped (→ Modifiée) for free.

- **Transitions map onto existing mutations.** Switching to a mode that needs more input is UI-only until the declarant acts; switching to a terminal/destructive mode fires immediately, with no confirmation dialog:
  - Undecided → Custom / Library: reveal form / `<Select>`, no mutation until Save / parent pick.
  - → Library (parent picked): `library.link*` copies parent content in (overwrites any custom edits).
  - Linked → Custom: detach keeping the mirrored content (`*.upsert`, `parent` null) — today's "Détacher".
  - any → Skip (schema): set `skipped`, clear content, null `parent`.
  - Skip → Custom / Library: clear `skipped`, then behave as Undecided→….

- **One generic component.** A `<SourceModeSection>` owns everything mode-related — the radio, mode derivation, the `<Select>`, the linked read-only block with a "used by N declarations" count (from `library.linkedDeclarations`, counting the current declaration), the transition wiring, and the section-frame/gate integration. It is parameterized per kind by config: `kind`, the radio `options` (schema adds Skip), `renderCustomForm({ form, readOnly })`, `renderLinkedReadOnly(value)`, and the form options + `declarationTo*Values` mapper. `Contact` and `Schema` sections collapse to thin wrappers.

## Consequences

**Easier:**

- The Custom/Linked/Skipped choice is one declarative spot, and the 2-vs-3 asymmetry lives in config, not branching.
- Schema is genuinely optional: a declarant with no scheme picks Skip and publishes, while the gate still forces the decision to be conscious.
- The picker/select/read-only plumbing exists once; the two sections stop being copy-paste twins.

**Harder / committed to:**

- A **second kind of gate error** now exists alongside per-field errors: a section-level "choose a mode" error emitted outside `runSchema`. A reader of `validateDeclaration` must know completeness is no longer purely "every field schema passes."
- **Derived mode is load-bearing.** Anything that writes `parent`, `skipped`, or clears content changes which radio option shows; these writes must stay consistent or the displayed mode misleads. (This is the cost we accept instead of a persisted `mode`.)
- A migration adds `schema.skipped`; existing schema groups default to not-skipped (Undecided/Custom as their content dictates).
- Undecided and "Custom selected but nothing saved" are the same persisted state, so they produce the same gate error. Accepted: both resolve to "fill it or pick another source."

## Alternatives considered

- **Persisted `mode` enum** (`linked`/`custom`/`skipped`) per group, set when the radio changes. **Rejected:** a second source of truth that can disagree with `parent`/`skipped`/content, plus a backfill for every existing row. Deriving from fields already present keeps one truth.
- **Let an absent schema pass the gate silently** (no Undecided error). **Rejected:** the product wants skipping to be a deliberate, recorded choice, not an accident of leaving the section blank — hence Undecided blocks until the declarant picks, including picking Skip.
- **Reuse "emptiness" to mean skipped** (no `skipped` flag). **Rejected:** empty must stay distinguishable from deliberately-skipped, otherwise the gate cannot tell "not decided yet" from "decided: none."
- **Keep two sections, extract only a shared hook.** **Rejected:** the radio / select / read-only JSX would still be duplicated across both; the product explicitly wanted one generic component.
- **Confirmation dialog on content-destroying switches** (Custom→Library, any→Skip). **Rejected for now:** today's dropdown already overwrites on select without a prompt; linked content survives in the Library and a discarded custom object is the declarant's explicit act. Kept light; revisit if it proves error-prone.

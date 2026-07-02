# ADR-0006: Autosave-on-edit in sequential mode, validate only at the publish gate

- **Status:** Accepted
- **Date:** 2026-06-18
- **Supersedes (in part):** ADR-0003 — the sequential footer's "Enregistrer et suivant" save-on-advance and per-section save-time validation are retired here. ADR-0003's mode split (sequential vs. standalone) and the declaration-wide gate concept survive.
- **Amended 2026-06-26:** the onBlur/onChange split in Decision §1 ("Autosave, not save-on-advance") and §5 ("Per-field validation display is onBlur") was reversed to a **uniform debounced-onChange** model. Autosave watches reactive form values and commits one debounced save after edits settle — there is no per-field-type blur path. Validation runs on `onChange`, with display gated by `isTouched` so a pristine field stays quiet until first edited. The debounce supplies the "settle before committing" onBlur was meant to give, while uniform onChange drops per-field-type blur wiring and clears a field's error live as it is corrected. The rest of this ADR (defer-to-gate, lenient partials, plain "Suivant", async-gated publish) stands.

## Context

ADR-0003 gave Brouillon declarations a sequential walkthrough whose footer **committed the current section and advanced** ("Enregistrer et suivant"), validating each section against its schema on the way through, with a final declaration-wide gate on the terminal Contact section. Two frictions emerged:

- **Save-on-advance double-validates and blocks navigation.** A declarant who wanted to move past a half-filled section to come back later was stopped: the footer ran the section schema and refused to advance on error. The walkthrough was meant to be guiding, not gating at every step.
- **Nothing persists until you advance.** Edits lived only in form state until the footer save fired. Navigating away by any other means lost them.

The desired model: every keystroke/selection in sequential mode persists as you go (autosave), navigation is always free, and completeness is checked **once**, at the publish gate.

This collides with the persistence layer. Three of the four section mutations rejected incomplete data: `declaration.update` (Infos), `contact.upsert`, and `schema.upsert` validated the **full** section schema server-side; only `audit.update` was already a lenient all-optional partial. Autosaving a half-filled Contact would have been rejected.

## Decision

**In sequential mode, persist edits as they happen and defer all completeness validation to the publish gate.**

- **Autosave, not save-on-advance.** Text/number fields autosave **onBlur**; discrete controls (radios, selects, switches, array add/remove) autosave **onChange** — each at its natural commit moment. A save fires only when the field/section is **dirty**. Success is **silent**; a failed autosave raises a DSFR `Alert` (a silent failure would lose data). The Library source-mode radio/select and the schema skip already persist via their own mutations and are unchanged.
- **Relax the three strict mutations to lenient partials**, mirroring `audit.update`. `contact.upsert` and `schema.upsert` accept any subset; `declaration.update` (Infos) accepts a partial **except** `entity` and `app_kind`, which stay `required` on the `declarations` collection (they are set at creation and never blanked). A Brouillon row may now hold incomplete section data — the publish gate is the **only** completeness check.
- **Plain "Suivant".** The footer is plain shallow link navigation in both modes; the "Enregistrer et suivant" / disable-nav-while-editing branches are removed. The terminal Contact section keeps **"Prévisualiser et publier"**.
- **The gate validates persisted state directly.** "Prévisualiser et publier" (and the top-of-page `StateNotice` CTA) **awaits any in-flight autosave**, then runs `validateDeclaration(declaration)` against the persisted data — no current-section commit, no live-form special case. Clean → preview; errors → redirect to the first errored section.
- **Per-field validation display is onBlur, not onChange.** While filling, a field reveals its own error when it loses focus; the gate still runs the full check. Contact's former `onChange` validator is dropped in favour of onBlur.
- **A summary redirect reveals the whole section's errors.** Landing on a section via an error-summary row (`?field=`) validates that section as if submitted and reveals all its field errors; in standalone mode it also force-enters edit so the errors are actionable without a Modifier click.

## Consequences

**Easier:**

- The walkthrough never blocks navigation; a declarant can fill sections in any order and come back, with nothing lost.
- One validation moment (the gate) instead of two (per-section save + gate). The "second validation entry point" ADR-0003 committed to is removed.
- The gate still reuses the exact section schemas (unchanged), so "required" has one definition.

**Harder / committed to:**

- **Brouillon rows can be incomplete at the DB level.** Any consumer of a draft declaration must treat section data as possibly-partial; completeness is guaranteed only after the gate passes. The "visible status is a pure function of two columns" invariant is unaffected.
- **Autosave failures are the only data-loss surface.** The DSFR `Alert` on failure is load-bearing, not decorative.
- **The publish action is now async-gated** on in-flight saves; it must track pending autosaves and flush the focused dirty field before validating, or it validates stale state.
- **Per-section relaxation is not uniform.** Infos keeps two Payload-required fields; a reader must not assume "all sections accept any partial."

## Alternatives considered

- **Keep save-on-advance, just don't block navigation.** Rejected: the footer would still need a save trigger and the "nothing persists until advance" data-loss window remains. Autosave subsumes both.
- **Autosave only when the section is currently valid.** Rejected: a half-filled section then silently fails to persist on navigation — the exact data-loss the change set out to remove, with no server changes to show for it.
- **A separate partial-draft JSON column, reconciled into typed columns when valid.** Rejected: a new persistence concept for a problem the lenient-partial mutations already solve; `audit.update` proved the partial-column approach works.
- **Validate the mounted section's live form values + persisted data for the rest** to dodge the publish race. Rejected: reintroduces a "current section" special case, contradicting "global validation directly."

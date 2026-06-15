# ADR-0002: Independent per-Sub-section audit forms

- **Status:** Accepted
- **Date:** 2026-06-08 (persistence target updated 2026-06-10, ADR-0004)

> This ADR's decision — **four independent forms, one per audit Sub-section** — is current and unchanged. Only the _persistence target_ moved: ADR-0004 deleted the `audits` collection, so the audit now lives as a group on the `declarations` row and `audit.upsert` patches that group. The body below describes the current shape directly; "1:1 with its Declaration" is now structural (a group), not service-enforced.

## Context

The audit Section is split into four [[sub-section]]s, each a URL-addressable destination on its own (ADR-0001): `audit-general` (formerly `audit-realisation`), `audit-outils`, `audit-contenus`, `audit-non-conformites`. All four persist into the **single** `audit` group on the Declaration's row — the slice is a UI grouping, not a data split.

The first implementation modelled the audit as **one** TanStack form carrying _every_ audit field, with a `section` discriminator. A single `auditMultiStepFormOptions.onSubmit` switched on `value.section` and validated only the active sub-schema via `parseValuesWithSchema`; a `pickSubSectionFields(value, subSection)` helper then re-derived which fields to send so the server's partial schema wouldn't reject untouched empty placeholders. This is the same `section`-discriminator shape the `declaration` form uses.

That shape produced a real bug: creating an audit from the first sub-section sent empty strings for fields owned by _other_ sub-sections (e.g. `compliantElements`), which the server's zod schema rejected. The fix kept growing hand-rolled scoping (`SUB_SECTION_FIELDS`, `pickSubSectionFields`, a merge-aware `update` that inferred `isRealised` from the presence of unrelated fields). The structural cause: one flat form pretending to be four.

TanStack Form 1.33 ships two grouping primitives, so the natural question was whether to adopt one:

- **`form.FormGroup` / `useFormGroup`** — declarative group `validators` + `onGroupSubmit`, but requires the group to be a **nested** object (`TName extends DeepKeys<TParentData>`) inside **one** mounted form holding all groups. Designed for a stepper/wizard where every step coexists in a single form.
- **`withFieldGroup`** — flat field _mapping_, reusable across different parent forms (the password/confirm-password case), but **no** group-level validators and **no** group submit.

## Decision

**Each audit Sub-section is its own self-contained form.** No `section` discriminator, no shared multi-step form options, no field-picking.

- Four independent zod schemas + `formOptions` in `auditSchema.ts`: `auditGeneral` (with a `.refine` — `isAuditRealised` required; if `true`, then `realisedBy`/`rgaa_version`/`rate` required), `auditTools`, `auditContents`, `auditNonConformities`. Each carries only its own fields.
- Four sibling section components (`AuditGeneralSection`, …), each owning one `useAppForm` + its schema as the `onSubmit` validator, mirroring `InfosSection`. `Content.tsx` routes each Sub-section to its own component.
- A shared `useAuditSubSection` hook owns the cross-cutting bits: the `api.audit.upsert` mutation (`onSuccess → onDeclarationChange`, no `router.reload`), the `useSectionForm` frame, and the not-realised notice (`showNotice = requiresRealised && !audit?.isRealised`). The form itself — the one thing that differs per Sub-section — stays in the component.
- Server exposes a single `audit.upsert({ values, declarationId })` that patches the `audit` group on the `declarations` row (the contact/schema convention): each call merges its slice into the group. Relation transforms stay keyed on field presence. `isRealised` is passed **explicitly** by the general form; the previous server-side inference is dropped. No `linkExisting` — the audit is strictly 1:1 with its Declaration, now structurally (it is a group on the row, not a separate collection).

The `audit-realisation` slug is renamed to `audit-general` as part of this redesign (no live URLs to break).

## Consequences

**Easier:**

- No more flat-form scoping machinery: `auditFormSchema`, `auditMultiStepFormOptions`, the `section` enum/switch, `SUB_SECTION_FIELDS`/`pickSubSectionFields`, and `AUDIT_SUB_SECTIONS.validator` are all deleted.
- Each form validates exactly its own fields — the create-time empty-placeholder bug is structurally impossible.
- `isRealised` is a client-supplied value, not inferred from the presence of unrelated fields.
- `upsert` returns the full audit row, so first-time creation refreshes `declaration.audit` in place — the `router.reload()` hack is gone.

**Harder / committed to:**

- The audit Section deliberately **diverges** from the `section`-discriminator pattern the `declaration` form still uses. A reader comparing the two will see two shapes for "a Section with sub-parts"; this divergence is intentional, not drift.
- Cross-cutting behaviour (notice, frame, mutation) must be deduplicated via `useAuditSubSection` rather than living once in a single component.
- The server `values` schema is a lenient all-optional partial (any one slice may arrive), unlike contact/schema whose `values` is the full entity schema.

## Alternatives considered

- **`form.FormGroup` (nested groups in one form)** — the library's "designed" answer for multi-part forms, with declarative group validators + `onGroupSubmit`. **Rejected:** its premise is a single mounted form holding all groups (a stepper). Our Sub-sections are _separate routes_, each mounting its own form with exactly one group visible (ADR-0001) — the other three groups would be dead nested state on every page. It also forces a flat → nested data-shape migration (every field name, the server payload, the flat `audits` collection) to buy ergonomics we'd only use one-group-at-a-time.
- **`withFieldGroup` (flat, reusable)** — keeps the flat data shape. **Rejected:** built for reusing the _same_ group across _different_ forms (password/confirm), which we don't need, and it provides no group-level validators or submit — the two things we actually wanted.
- **Keep the `section`-discriminator + `pickSubSectionFields`** — consistent with `declaration`. **Rejected:** it is the source of the bug and requires hand-rolled scoping the library should not need; four independent forms express the reality (four forms, one row) directly.

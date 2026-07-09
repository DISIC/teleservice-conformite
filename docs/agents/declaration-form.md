# Declaration form — area map

Navigational map of the declaration details page (`/dashboard/declarations/[id]?section=<slug>`) — the editing surface for a Declaration's Sections. Read this before working in the area, then open only the files your task touches. Vocabulary is defined in `CONTEXT.md`; reasoning lives in `docs/adr/` — this file only says **where things are**.

## The 60-second map

```
pages/dashboard/declarations/[id]/index.tsx     page entry: SSR, status → editing mode,
  │                                             publishAttempted flag, ErrorSummary, SideMenu
  └─ components/declaration/sections/Content.tsx   SECTION_RENDERERS slug → component lookup
       └─ items/{Infos,Audit,Schema,Contact}.tsx   one component per Section (Audit exports 4,
            │                                      one per Sub-section, via useAuditSubSection)
            ├─ forms/<section>/<section>Form.tsx     fields (TanStack withForm)
            ├─ forms/<section>/<section>Schema.ts    Zod strict + draft variants + declarationTo<X>Values
            ├─ utils/declaration/useSectionForm.tsx  Frame (shell+<form>) + readOnly machine + afterSave
            ├─ utils/declaration/useLiveSectionForm.ts  autosave (sequential) + error reveal wiring
            └─ api.<section>.upsert/update            tRPC mutation
                 └─ server/api/routers/…              persists into the declarations row (Payload)
```

**First-read file:** `src/utils/declaration/sections.ts` — the Section registry. Every slug, title, SideMenu badge predicate, and validation entry derives from its `SECTIONS` object. Audit Sub-section metadata is merged in from `auditSubSections.ts`.

## Concept → files

| To understand…                                          | Read (in order)                                                                                                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which Section renders, prev/next navigation             | `utils/declaration/sections.ts` → `components/declaration/sections/Content.tsx`                                                                                                                                                       |
| Editing mode (sequential vs standalone)                 | `utils/declaration/status.ts` (`getDeclarationStatus` → `getEditingMode`) — decided once per page load in `pages/dashboard/declarations/[id]/index.tsx`                                                                               |
| A Section's render skeleton, edit/save buttons          | `utils/declaration/useSectionForm.tsx` (`Frame`) → `components/declaration/sections/Shell.tsx`                                                                                                                                        |
| Autosave                                                | `utils/declaration/useLiveSectionForm.ts` → `useAutosave.ts` (debounce = `AUTOSAVE_DEBOUNCE_MS` in `forms/formOptions.ts`); sequential mode only                                                                                      |
| Form validation triggers                                | `forms/formOptions.ts` (`sectionFormOptions`: onChange when sequential, onSubmit when standalone)                                                                                                                                     |
| The publish gate                                        | `utils/declaration/usePublishAttempt.ts` → `validateDeclaration.ts` → `SECTIONS[slug].validation` → `forms/*/​*Schema.ts`                                                                                                             |
| Error summary + focus-on-field after a publish redirect | `components/declaration/sections/ErrorSummary.tsx`, `utils/declaration/useRevealSectionErrors.ts`, `sectionHref(id, slug, field)`                                                                                                     |
| Source mode (Linked / Custom / Skipped) and the Library | `utils/declaration/sourceMode.ts` → `useSourceMode.ts` → `useLibraryLink.ts` → `components/declaration/sections/SourceModeSection.tsx`; mutations in `server/api/routers/library/` (`index.ts` routes → kind-parametric `service.ts`) |
| SideMenu badges (À compléter / À vérifier)              | `SECTIONS` predicates in `sections.ts`; presentation in `utils/declaration/state.ts` (`SECTION_BADGE`)                                                                                                                                |
| Status / Declaration state (notice card)                | `utils/declaration/status.ts` (lifecycle) and `state.ts` (`getDeclarationState`) — distinct axes, see CONTEXT.md                                                                                                                      |
| The save path server-side                               | section router (`server/api/routers/library/index.ts` `contact.upsert`, `audit.ts` `update`, `declaration/index.ts` `update`) → `server/api/utils/publish-comparison.ts` (`recalculateDeclarationStatus`)                             |
| Field storage                                           | `payload/collections/Declaration.ts` + `payload/fields/{audit,contact,schema}.ts` — everything lives on the one declarations row                                                                                                      |
| Publish / revert / creation mutations                   | `server/api/routers/declaration/index.ts` (procedures) → `service.ts` (logic)                                                                                                                                                         |

Shared field UI (`Part`, `TextField`, `ActionButtons`, `RequiredField`) lives in `components/form/`; the TanStack form hook and field bindings in `forms/context.ts`.

## Anatomy of one Section component

`items/Contact.tsx` is the canonical example: it builds default values from the declaration, creates the form with `useAppForm(sectionFormOptions(...))`, calls its mutation (`api.contact.upsert`), and renders inside `SourceModeSection` (Library-sourced) or directly inside `Frame` (Infos, Audit). The four Audit Sub-sections share `useAuditSubSection` in `items/Audit.tsx` and all persist through `api.audit.update` into the single `audit` group.

## Adding a Section

1. Zod pair in `forms/<name>/<name>Schema.ts` — strict schema, lenient draft variant, `declarationTo<Name>Values` mapper.
2. Fields in `forms/<name>/<name>Form.tsx`.
3. Field group in `payload/fields/<name>.ts`, registered in `payload/collections/Declaration.ts`; regenerate `payload-types.ts`.
4. Router with an `upsert` in `server/api/routers/<name>.ts`, wired into `server/api/root.ts`; end the mutation with `recalculateDeclarationStatus`.
5. Component in `components/declaration/sections/items/<Name>.tsx` (wrap with `SourceModeSection` if Library-sourced).
6. Register the slug in `SECTION_SLUGS` + `SECTIONS` (`sections.ts`) — title, badge predicates, validation.
7. Add the renderer to `SECTION_RENDERERS` in `Content.tsx`.

## Gotchas

- `Frame`'s `useCallback` deps in `useSectionForm.tsx` must stay stable during autosave — a dep change remounts the form subtree and wipes in-progress field validation.
- `Content.tsx` keys its Fragment by slug: navigating Sections always remounts, so edit state never survives navigation.
- `validateDeclaration` reads the **persisted** declaration, not live form values — an unsaved edit doesn't count until autosave/save lands.
- Autosave payloads must be storable at any point mid-fill: no `NaN`/unserialisable values in form state, and no required-field validation on the Payload group — a rejected slice fails silently and every retry (and the unmount flush) fails with it. Completeness belongs to the publish gate only.
- The publish CTA on the terminal Contact section bypasses the section form's own submit (`onPublish` on `Frame`).

## Don't read

- `payload/payload-types.ts` (831 lines, generated) and `payload/migrations/` — never edit; grep for a type name if needed.
- `src/app/` — Payload admin + better-auth routes only; the entire app surface is Pages Router.
- `pages/dashboard/testalbert.tsx` — debug page for the Albert extraction.

## Verifying a change

`yarn test` (vitest, no DB or browser) covers the pure seams: `validateDeclaration`, `getDeclarationState`, `getDeclarationStatus`/`getEditingMode`, `deriveSourceMode`, the publish snapshot (`extractDeclarationContentToPublish`), the Section registry helpers, and every section schema + its `declarationTo<X>Values` mapper. Tests live in `src/tests/` — `declaration/` for the gate/state/registry/snapshot logic, `forms/` for the section schemas, one file per module under test, named after it; `completeDeclaration()` in `src/tests/declaration/declaration.fixture.ts` builds a minimal gate-passing Brouillon — override only your delta. Anything involving hooks, autosave timing, or tRPC still needs a manual run (`yarn dev`).

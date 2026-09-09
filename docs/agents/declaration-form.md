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
            ├─ sections/hooks/useSectionForm.tsx     Frame (shell+<form>) + readOnly machine + afterSave
            ├─ sections/hooks/useLiveSectionForm.ts  autosave (sequential) + error reveal wiring
            └─ api.<section>.upsert/update            tRPC mutation
                 └─ server/api/routers/…              persists into the declarations row (Payload)
```

**First-read file:** `src/domain/declaration/sections.ts` — the Section registry. Every slug, title, SideMenu badge predicate, and validation entry derives from its `SECTIONS` object. Audit Sub-section metadata is merged in from `auditSubSections.ts`.

## Concept → files

| To understand…                                          | Read (in order)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which Section renders, prev/next navigation             | `domain/declaration/sections.ts` → `components/declaration/sections/Content.tsx`                                                                                                                                                                                                                                                                                                                                                        |
| Editing mode (sequential vs standalone)                 | `domain/declaration/status.ts` (`getDeclarationStatus` → `getEditingMode`) — decided once per page load in `pages/dashboard/declarations/[id]/index.tsx`                                                                                                                                                                                                                                                                                |
| A Section's render skeleton, edit/save buttons          | `components/declaration/sections/hooks/useSectionForm.tsx` (`Frame`) → `components/declaration/sections/Shell.tsx`                                                                                                                                                                                                                                                                                                                      |
| Autosave                                                | `sections/hooks/useLiveSectionForm.ts` → `useAutosave.ts` (debounce = `AUTOSAVE_DEBOUNCE_MS` in `forms/formOptions.ts`); sequential mode only                                                                                                                                                                                                                                                                                           |
| Form validation triggers                                | `forms/formOptions.ts` (`sectionFormOptions`: onChange when sequential, onSubmit when standalone)                                                                                                                                                                                                                                                                                                                                       |
| The publish gate                                        | `sections/hooks/usePublishAttempt.ts` → `domain/declaration/validate.ts` → `SECTIONS[slug].validation` → `forms/*/​*Schema.ts`                                                                                                                                                                                                                                                                                                          |
| Error summary + focus-on-field after a publish redirect | `components/declaration/sections/ErrorSummary.tsx`, `sections/hooks/useRevealSectionErrors.ts`, `sectionHref(id, slug, field)`                                                                                                                                                                                                                                                                                                          |
| Source mode (Linked / Custom / Skipped) and the Library | `domain/declaration/sourceMode.ts` (pure derivation) → `sections/hooks/useSourceMode.ts` → `useLibraryLink.ts` (+ `sections/applySavedDeclaration.ts`) → `components/declaration/sections/SourceModeSection.tsx`; mutations in `server/api/routers/library/` (`index.ts` routes → kind-parametric `service.ts`)                                                                                                                         |
| SideMenu badges (À compléter / À vérifier)              | `SECTIONS` predicates in `sections.ts`; presentation in `domain/declaration/state.ts` (`SECTION_BADGE`)                                                                                                                                                                                                                                                                                                                                 |
| Status / Declaration state (notice card)                | `domain/declaration/status.ts` (lifecycle) and `state.ts` (`getDeclarationState`) — distinct axes, see CONTEXT.md                                                                                                                                                                                                                                                                                                                       |
| The save path server-side                               | `declarationProcedure` (`server/api/trpc.ts`, guard + `ctx.declaration` via `server/api/utils/declaration-access.ts`) → section router (`server/api/routers/library/index.ts` `contact.upsert`, `audit.ts` `update`, `declaration/index.ts` `update`) → `server/api/utils/section-write.ts` (`saveSection`: the Section's merge rule → `writeDeclaration`: status derived from the row as written, one update, returns the Declaration) |
| Field storage                                           | `payload/collections/Declaration.ts` + `payload/fields/{audit,contact,schema}.ts` — everything lives on the one declarations row                                                                                                                                                                                                                                                                                                        |
| Publish / revert / creation mutations                   | `server/api/routers/declaration/index.ts` (procedures) → `service.ts` (logic)                                                                                                                                                                                                                                                                                                                                                           |
| The published snapshot and its public rendering         | `domain/declaration/published/snapshot.ts` (`extractDeclarationContentToPublish`, `parsePublishedDeclaration` — the Zod contract) → `published/markdown.ts` (`buildPublishedMarkdown`, pure) → `components/declaration/PublishedTemplate.tsx` + `MarkdownToJsx.tsx`; public page `pages/declarations/[id]/publish.tsx` swaps the app header via `renderHeader` (`components/layout/pageHeader.ts`) for `PublishedHeader.tsx`            |

Shared field UI (`Part`, `TextField`, `ActionButtons`, `RequiredField`) lives in `components/form/`; the TanStack form hook and field bindings in `forms/context.ts`.

## Anatomy of one Section component

`items/Contact.tsx` is the canonical example: it builds default values from the declaration, creates the form with `useAppForm(sectionFormOptions(...))`, calls its mutation (`api.contact.upsert`), and renders inside `SourceModeSection` (Library-sourced) or directly inside `Frame` (Infos, Audit). The four Audit Sub-sections share `useAuditSubSection` in `items/Audit.tsx` and all persist through `api.audit.update` into the single `audit` group.

## Adding a Section

1. Zod pair in `forms/<name>/<name>Schema.ts` — strict schema, lenient draft variant, `declarationTo<Name>Values` mapper.
2. Fields in `forms/<name>/<name>Form.tsx`.
3. Field group in `payload/fields/<name>.ts`, registered in `payload/collections/Declaration.ts`; regenerate `payload-types.ts`.
4. Add the Section's kind, patch schema and merge rule to `server/api/utils/section-write.ts`; the router's `upsert` (built on `declarationProcedure`, input `{ declarationId, values }`) is one `saveSection(ctx.payload, ctx.declaration, kind, values)` call returning `{ data }`, wired into `server/api/root.ts`.
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

`yarn test` (vitest, no DB or browser) covers the pure seams: `validateDeclaration`, `getDeclarationState`, `getDeclarationStatus`/`getEditingMode`, `deriveSourceMode`, the publish snapshot (`extractDeclarationContentToPublish`, `parsePublishedDeclaration`), `hasContentChangedSincePublish`, the public document (`buildPublishedMarkdown` — three `.md` snapshots under `src/tests/declaration/published/__snapshots__/markdown/`), the Section registry helpers, every section schema + its `declarationTo<X>Values` mapper, and the Section write (`saveSection` against a stubbed Payload: merge rules and the one-write status derivation). Tests live in `src/tests/` and mirror the layer they cover — `declaration/` (with `published/`) for `domain/declaration/`, `forms/` for the section schemas, one file per module under test, named after it; `completeDeclaration()` in `src/tests/declaration/declaration.fixture.ts` builds a minimal gate-passing Brouillon — override only your delta. Anything involving hooks, autosave timing, or tRPC still needs a manual run (`yarn dev`).

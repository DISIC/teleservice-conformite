# ADR-0008: A `domain/` layer instead of a `utils/` bucket

- **Status:** Accepted
- **Date:** 2026-09-08

## Context

`src/utils/` had grown to 23 files and 2 000 lines, 18 of them under `utils/declaration/`. The name promised nothing, so a reader could not predict its contents: it mixed the pure Declaration rules (Section registry, publish gate, status and state, published snapshot), eight React hooks used by a single component tree, a better-auth middleware, an alert event bus, a browser clipboard wrapper and the Albert prompt file. Two top-level files (`declaration-content.ts`, `declaration-helper.ts`) sat next to the `declaration/` folder they belonged to, and `declaration-helper.ts` served four unrelated audiences. Domain code also imported a type from a component, inverting the dependency direction.

`CONTEXT.md` already listed the layers and warned against a utils bucket, but the pure Declaration logic had no layer to go to: it is neither UI, nor form, nor infrastructure, nor server.

## Decision

Add `src/domain/` as the layer for pure business logic and dissolve `src/utils/` entirely. `domain/declaration/` holds the Declaration rules (registry, gate, status, state, source-mode derivation, conformity, and `published/` for the snapshot contract and markdown builder). It may import types from `payload/` and `server/api/utils/payload-helper.ts` and values from `forms/` schemas, but never React, tRPC, the DOM, or `components/`. Everything else in the old bucket moves to the layer it serves: Section-form hooks to `components/declaration/sections/hooks/`, the alert bus next to `AlertHost`, auth glue to `lib/`, the Albert prompt into its router folder. Tests in `src/tests/` mirror the layer they cover.

## Consequences

- A reader or agent locates a rule by asking "is it pure?" (`domain/`), "is it UI?" (`components/`), "is it a form contract?" (`forms/`), or "is it glue?" (`lib/`). The area map in `docs/agents/declaration-form.md` is shorter because paths now carry meaning.
- `domain/` is the natural home for the next two candidates (server-side and client-side Section logic) and for future aggregates (a `domain/library/` once the Library grows rules of its own).
- The dependency rule is one-directional and greppable: `grep components/ src/domain` must return nothing.
- `domain/declaration/` still imports the `PopulatedDeclaration` type from `server/api/utils/payload-helper.ts`. Moving that type into the domain is a follow-up, not part of this decision.
- `server/api/routers/declaration/utils.ts` keeps its name for now; it is the server-side candidate mentioned above.

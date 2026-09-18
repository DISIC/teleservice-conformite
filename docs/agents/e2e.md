# End-to-end suite — area map

Navigational map of the Playwright suite of the teleservice (`apps/teleservice/e2e/`). It drives the real application in Chromium, Firefox and WebKit against a throwaway Postgres, signed in through the ProConnect integration environment, and runs axe at chosen checkpoints. Vocabulary is defined in `CONTEXT.md`; this file only says **where things are** and which rules keep the suite small and stable.

## The 60-second map

```
e2e/run.js                        `pnpm e2e`: Testcontainers Postgres → `payload migrate` → `playwright test`
playwright.config.ts              projects: chromium / firefox / webkit (depend on `setup`), then `setup`
  │                               webServer: `next dev` locally (own `.next-e2e`), `next start` in CI
  ├─ e2e/auth.setup.ts            the setup project: one ProConnect login per run, saved to e2e/.auth/user.json
  ├─ e2e/<flow>.spec.ts           one file per flow, five in the first wave
  └─ e2e/support/
       ├─ fixtures.ts             `test` with `uniqueName`, `seed.declaration(state)`, `a11y.check(checkpoint)`, worker `payload`
       ├─ proconnect.ts           the ProConnect login steps
       ├─ seed.ts                 glossary states produced through the app's own service functions (Local API)
       ├─ declarationPage.ts      plain helpers: waitForSave, checkRadio, createManualDeclaration, goToNextSection, openListRow…
       ├─ a11y.ts                 the axe checkpoint; a11yAllowlist.ts holds proven false positives (empty)
       ├─ identity.ts             the ProConnect test identity and the session file path
       └─ extensionless-hooks.js  Node resolve hook for react-dsfr's extensionless ESM imports
```

**First-read file:** `e2e/support/seed.ts` — every state a test starts from, named after the glossary.

## Concept → files

| To understand…                    | Read                                                                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How a run is assembled            | `e2e/run.js` (container, migrations, stale session removed, `NODE_ENV=production` for the runner, setup project before UI mode) → `playwright.config.ts` |
| How tests are signed in           | `e2e/auth.setup.ts` (the `setup` project every browser project depends on) → `e2e/support/proconnect.ts`; tests load the saved session and never log in  |
| How a Declaration reaches a state | `e2e/support/seed.ts` (`SEED_STATES`, `advance`) → `server/api/routers/declaration/service.ts`, `server/api/utils/section-write.ts`                      |
| Which flow covers what            | `brouillon-to-publiee`, `publiee-edits`, `published-incomplete`, `obsolescence`, `state-matrix` — one spec each, named after the glossary                |
| Waiting for a save                | `waitForSave(page, "<router>.<procedure>", "<value the request carries>")` in `declarationPage.ts`                                                       |
| Accessibility checks              | `a11y.ts` (tags, soft assertion, attachment, animation settle) → `a11yAllowlist.ts`                                                                      |
| Where copy comes from             | `domain/declaration/state.ts` (`STATE_PRESENTATION`, `SECTION_BADGE`), `sections.ts` (`SECTION_TITLES`), `obsolescence.ts` (`OBSOLESCENCE_PRESENTATION`) |
| The CI job                        | `.github/workflows/e2e.yml`                                                                                                                              |

## Rules

- **A core, not a net.** About ten tests at most. Each flow is one linear story through real screens; the state matrix is a single test looping over seeded states. A regression that a unit test can catch belongs in `src/tests/`.
- **Waves.** First wave: the sequential walkthrough and publish gate, Publiée edits (Modifiée, revert, republish), published-incomplete, Obsolescence, the Declaration state matrix. Second wave: Library and Source mode. Out of scope: Import ARA and Import IA (server-side fetch to external APIs), Membres and invitations, the Payload admin.
- **Seed, don't click.** Any starting state comes from `seed.declaration(state)`. It is valid by construction because the seeder calls the same functions as the routers. Only public snapshot fields drift a Publiée row: the contact email or URL, never the contact name.
- **One shared user, uniquely named rows.** The `setup` project signs in once per run and every browser project loads its session. Every test uses the same identity; isolation is a unique Declaration name per test (`uniqueName`). Find a list row with `openListRow(page, name)`, never count rows, never delete or rename data another test may read. UI-created rows attach to the shared ProConnect entity: a sector chosen in one test is visible to the others, so gate checks hinge on per-Declaration fields, not on the entity.
- **Locators.** Role and accessible name first, copy imported from the domain constants, never a DSFR class name, test ids only as a last resort (none so far). DSFR draws radios on the label, which overlays the input: use `checkRadio`.
- **Waits.** No `waitForTimeout`. A save is proven by its tRPC answer and by the effect on the page.
- **Axe.** `a11y.check("…")` at every meaningful page state a flow already reaches: modals open, error summary shown, notices, interstitial, public page. Chromium only. WCAG 2.1 A and AA tags, no best-practice rules. Every violation fails, through a soft assertion so one run reports every checkpoint. A proven false positive goes in `a11yAllowlist.ts` with its rule, target and reason.

## Running

- `pnpm --filter teleservice e2e` from the root, or `pnpm e2e` in the app. Requires Docker. Port 3000 must be free: the ProConnect integration client registers only `http://localhost:3000/api/better-auth/callback/proconnect`, so stop `pnpm dev` first, or register another port's callback and run with `E2E_PORT=<port>`.
- Playwright arguments pass through: `pnpm e2e --project=chromium`, `pnpm e2e -g "Obsolescence"`, `pnpm e2e:ui`.
- `pnpm e2e:ui` opens UI mode. Playwright's UI mode skips dependency projects and ticks only the first project by default (microsoft/playwright#21952, a kept default), so the runner signs in through the `setup` project before opening the window, and the browser projects are listed first. The Projects filter is remembered between sessions: if `setup` is ticked, tick a browser instead. Runs share the container and the session for as long as the window stays open.
- `E2E_PROD=1 pnpm e2e` replays the CI path against `next start`; run `pnpm build` first.
- CI runs `.github/workflows/e2e.yml` on pull requests and on main whenever `apps/teleservice/**` changes: all three browsers, HTML report uploaded on failure, skipped on forks because they receive no secrets. Repository secrets: `PROCONNECT_INTEG_CLIENT_ID`, `PROCONNECT_INTEG_CLIENT_SECRET`.
- Never wired into lefthook: CI owns the suite.

## Adding a flow

1. Check it fits the cap and the wave; prefer extending an existing story over a new file.
2. Start from a seeded state. A missing state is one entry in `SEED_STATES` and one branch in `advance()`, produced through service functions.
3. Put a helper in `declarationPage.ts` only once a second spec needs it.
4. Add an `a11y.check` at each new page state.
5. Run the three browsers twice before committing.

## Gotchas

- Next 16 allows one `next dev` per dist directory: the e2e server uses `NEXT_DIST_DIR=.next-e2e` (read by `next.config.js`), and `tsconfig.json` pre-declares its type globs so Next stops rewriting the file.
- `@codegouvfr/react-dsfr` ships ESM with extensionless relative imports; the resolve hook registered from `playwright.config.ts` makes the domain modules load in the test process.
- `run.js` deletes `e2e/.auth/user.json` at startup: a session saved against a previous database only logs the tests out.
- The runner sets `NODE_ENV=production` for Playwright so the seeder's Payload neither pushes schema nor regenerates `payload-types.ts`; it loads the app `.env` for the secrets without overriding existing variables. Playwright itself never reads `.env`.
- `test@fia1.fr` is the legacy ProConnect test identity; the current documentation uses any address in `@test.proconnect.gouv.fr`. Both route to the test identity provider today; change `identity.ts` if fia1 disappears.
- The error summary counts fields, and the "email or URL" contact rule flags two of them.
- DSFR modals fade in; the axe checkpoint waits for running animations before measuring contrast.

## Don't read

- `e2e/.auth/`, `test-results/`, `playwright-report/`, `.next-e2e/` — generated, ignored by git.

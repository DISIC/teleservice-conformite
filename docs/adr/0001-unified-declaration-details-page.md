# ADR-0001: Unified Declaration details page with `?section=` routing

- **Status:** Accepted
- **Date:** 2026-05-26

## Context

The current Declaration details page (`/dashboard/declaration/[id]`) shows a Démarche tab with four tiles, each linking to its own child route:

- `/dashboard/declaration/[id]/infos`
- `/dashboard/declaration/[id]/audit`
- `/dashboard/declaration/[id]/contact`
- `/dashboard/declaration/[id]/schema`

Each child page does its own SSR (`guardDeclaration`), renders a `<DeclarationForm>` chrome, and navigates back to the parent on save. The audit child page additionally runs a `MultiStep` wizard with 5 internal steps when no audit exists yet.

For the redesign-v2, the product direction is to **lift the four content [[section]]s into the parent details page** so that:

- The user navigates between Sections through a left `SideMenu` (DSFR `SideMenu`) instead of clicking through tiles and child routes.
- Each Section defaults to read-only and exposes a per-Section "Modifier" edit toggle.
- The audit's four [[sub-section]]s are independently navigable as nested sidebar entries.
- The page chrome (declaration name, status badge, 3 stats cards, action buttons) is visible across all Sections.

This forces a routing decision: stay with one-route-per-Section and share a layout component, or collapse to a single route that switches Sections via URL state.

## Decision

**One route, one page, with the active Section encoded as a `?section=<slug>` query parameter.**

- `/dashboard/declaration/[id]?section=infos` (default landing when `?section` is omitted)
- `/dashboard/declaration/[id]?section=audit-realisation` (audit Sub-sections use dotted-hyphenated slugs)
- `/dashboard/declaration/[id]?section=audit-outils`
- `/dashboard/declaration/[id]?section=audit-contenus`
- `/dashboard/declaration/[id]?section=audit-non-conformites`
- `/dashboard/declaration/[id]?section=schema`
- `/dashboard/declaration/[id]?section=contact`

Section switches use `router.push(url, undefined, { shallow: true })`. The parent runs `getServerSideProps` once per visit and holds the populated `Declaration` in state; section components are dispatched client-side.

The audit's `MultiStep` wizard is retired. First-time entry is gated by enabling sub-sections in the sidebar only after `audit.isRealised` has been saved (hybrid approach); after that, all visible audit Sub-sections are freely navigable.

## Consequences

**Easier:**

- The 3 stats cards, status badge, action buttons, and Membres tab live in one place and don't need to be re-rendered or duplicated across four routes.
- Section switches no longer trigger SSR or page transitions — the user feels they're inside one shell.
- Edit/read-only state is local to each Section component; no cross-route coordination.
- Audit Sub-sections live as URL-addressable destinations without forcing the file structure to grow to `audit/realisation.tsx`, `audit/outils.tsx`, etc.

**Harder:**

- The parent page becomes a section dispatcher. Existing child page logic (`audit.tsx`, `contact.tsx`, `infos.tsx`, `schema.tsx`) must be extracted into `<SectionComponent>`s that no longer own SSR or full-page chrome.
- Unsaved-changes handling becomes a UX responsibility: bottom Retour/Suivant are disabled in edit mode; SideMenu and Tab clicks while editing show a "Quitter sans enregistrer ?" confirm modal; `beforeunload` guards browser navigation.
- The `formContainer` style in `_app.tsx` (which adds `paddingInline: 16rem` at ≥1024px) is too narrow for the SideMenu + content layout and must be overridden for the declaration details page (or moved into a `commonClasses` helper).
- Existing bookmarks to `/dashboard/declaration/[id]/audit` etc. break unless redirects are added. (Redirects from `[id]/<section>.tsx` files to `[id]?section=<section>` are cheap and recommended.)

**Committed to:**

- SideMenu and SectionComponent abstraction in the dashboard layer.
- A single set of section slugs as the source of truth for the URL parameter, the SideMenu items, and the Suivant/Retour walk order.
- DSFR + tss styling exclusively; no MUI in the redesigned page.

## Alternatives considered

- **Nested routes (`/dashboard/declaration/[id]/[section]`)** — keeps separate page files but loses single-page feel. Pages Router has no nested layouts, so the SideMenu chrome would have to be re-mounted on every route change; SSR would re-run; local state (audit sub-step, dirty form values) would be lost on Section switch. Rejected.
- **Hash routing (`#audit-outils`)** — avoids SSR re-runs and Next.js router involvement entirely. Rejected for ambiguity with anchor links and because `?section=` is more conventional for application state.
- **Two query params (`?section=audit&sub=outils`)** — cleaner data model but more awkward to wire into a single `SideMenu` item `linkProps.href` and adds branching on every URL read. Rejected in favour of dotted-hyphenated slugs in one param.
- **Collapse audit Sub-sections to a single `?section=audit` slug, internal state in AuditSection** — would make the slug scheme match the data model (one Audit row → one Section) and remove `isAuditSubSection` guards, the `audit-realisation`-always-visible filter, and the parallel render switch inside AuditSection. **Rejected** because three UX properties are load-bearing: (1) each Sub-section must have a shareable URL, (2) the SideMenu must show per-Sub-section "À compléter" badges, (3) the four Sub-sections must be independently navigable as nested SideMenu entries. Internal state would force either collapsing the SideMenu children (loses scannability) or lifting state out of AuditSection (defeats the encapsulation). The duplication that remains — audit-\* slugs appearing in both the top-level `SECTIONS` registry and inside AuditSection — is concentrated by extracting a single `auditSubSections.ts` module both consume.
- **App Router migration** — would give true nested layouts. Out of scope: requires rewiring `withDsfr`, the emotion SSR setup, and every existing page. Defer to a separate decision.

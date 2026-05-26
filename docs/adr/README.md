# Architecture Decision Records

This directory holds ADRs for Téléservice Conformité. Each ADR captures a single architectural decision: the context that forced the choice, the options considered, what was picked, and the consequences.

## Conventions

- Filename: `NNNN-short-kebab-title.md` (zero-padded, e.g. `0001-payload-for-cms.md`).
- Numbers are monotonically increasing — never reuse a number, even for superseded ADRs.
- One decision per file. If a follow-up changes the decision, write a new ADR that supersedes the old one (link both ways).
- Status: `Proposed` → `Accepted` → optionally `Superseded by ADR-NNNN` or `Deprecated`.

## Template

```markdown
# ADR-NNNN: <Title>

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- **Date:** YYYY-MM-DD

## Context

What forced this decision? What constraints, prior art, or pain points led here?

## Decision

What we're doing. One paragraph, declarative.

## Consequences

What gets easier, what gets harder, and what we're now committed to. Include the obvious downsides — future-us will thank present-us.

## Alternatives considered

Bulleted list of options that lost, with one-line reasons.
```

ADRs are created by `/engineering:architecture` or `/grill-with-docs` when a decision actually crystallises during real work. Don't write ADRs speculatively.

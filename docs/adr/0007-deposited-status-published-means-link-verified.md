# ADR-0007: Three-step Status — Déposée is the public dépôt, Publiée means the link is verified

- **Status:** Accepted
- **Date:** 2026-11-24
- **Amends:** ADR-0003, ADR-0004, ADR-0005, ADR-0006 (vocabulary only: what they call "publish" is now the dépôt)

## Context

The platform does not exist so that accessibility declarations are written; it exists so that each digital service **links to its declaration**, where citizens can find it. Until now [[status]] was binary: Brouillon, then Publiée as soon as the declarant pressed publish — meaning "validated, snapshot taken, public page online at `/declarations/[id]/publish`".

That name claimed more than the platform knew. A declaration read "Publiée" while nothing told us whether the service's footer pointed to it, so the one outcome the platform is accountable for was invisible in its own lifecycle.

## Decision

**Status has three values, walked in order: Brouillon → Déposée → Publiée.**

- **Déposée** takes over everything Publiée used to mean. The **dépôt** validates every Section, takes the snapshot and puts the public page online.
- **Publiée** is Déposée **plus** one fact: the platform has verified that the digital service links to the public page. It is a fact about the link, not the content — editing and depositing again keep it; only a verification that no longer finds the link removes it.
- Status is derived from two facts on the row: whether a snapshot exists (`depositedContent`) and whether the link is verified (`link_verified_at`, a nullable date). The `status` column keeps its own, unrelated meaning — whether the row still matches its snapshot (`deposited` / `undeposited`), which feeds the Modifiée Declaration state.
- **Every identifier that meant the dépôt is renamed to deposit vocabulary**, so `publish*` in code only ever means the link-verified Publiée. Two deliberate exceptions: `first_published_at` ("Date de publication initiale" is a real-world fact stated by the declarant, not a lifecycle step) and the public address `/declarations/[id]/publish` (a public contract: it is what services paste in their footer).
- **Link verification itself is not designed yet.** `link_verified_at` exists and nothing writes it, so no Declaration is Publiée until that work lands.

## Consequences

- A declaration can be publicly reachable and still not Publiée. This is deliberate: reachable by address is the dépôt, reachable from the service is the publication.
- Status is no longer a function of the snapshot alone; the invariant now names two facts, and link verification is the only writer of the second.
- Everything attached to the old publish action follows the dépôt unchanged: the completeness gate, the snapshot, Modifiée and revert, the sequential → standalone switch, and the three-year Obsolescence clock (counted from the last dépôt — an unverified Déposée declaration still becomes Obsolète).
- A clean Déposée declaration has an obvious next action — integrate the link — that no notice announces yet. It comes with the verification design, together with these open questions: what writes `link_verified_at`, how often the link is re-checked, whether changing the service's URL clears the verification, and how a revert — which restores a whole earlier version of the row — is kept from bringing back an older verification date.
- Earlier ADRs keep their original wording and carry an amendment line pointing here.
- The rename happened while the application was in preprod with no data to preserve: the migration is generated, not hand-written, and existing rows could be discarded. After launch the same rename would need a data-preserving migration.

## Alternatives considered

- **Keep Status binary and add link verification as a separate axis**, like Obsolescence. Rejected: verification is the last step of the same progression the declarant is walking, not an independent quality of the declaration, and a fourth axis next to Status, Declaration state and Obsolescence would hide the product's goal behind a secondary indicator.
- **Keep "published" for the dépôt and name the new step differently** ("Vérifiée"). Rejected: "Publiée" should mean what a citizen experiences. Keeping the old identifiers "for history" would leave two meanings of `published` in the code, and preprod made the rename free now and expensive ever after.
- **Store the lifecycle in the `status` column.** Rejected: that column already answers a different question (does the row match its snapshot), and Status stays derived rather than written.
- **Add `"published"` to the type with no stored fact behind it.** Rejected: an unreachable value that no test can cover.

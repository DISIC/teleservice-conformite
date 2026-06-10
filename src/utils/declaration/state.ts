import { fr } from "@codegouvfr/react-dsfr";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { getDeclarationStatus } from "./status";
import { validateDeclaration } from "./validateDeclaration";

/**
 * A derived, presentation-facing state answering "what should the declarant do
 * next?", surfaced as the top-of-page notice card. Distinct from {@link Status}:
 * `DeclarationState` folds completeness and AI-verification on top of the pure
 * lifecycle. See the "Declaration state" glossary entry in CONTEXT.md.
 *
 * `null` (clean Publiée, unchanged) renders no notice.
 */
export type DeclarationState =
	| "incomplete"
	| "to-verify"
	| "ready"
	| "published-modified";

/** Actions a notice may expose, in render order. Handlers are wired by the component. */
export type StateAction = "revert" | "publish";

type StatePresentation = {
	/** Card background — a `background.alt.<family>.default` decision token. */
	bgColor: string;
	/**
	 * Optional top badge. A plain grey DSFR `<Badge>` recoloured with a
	 * contrast-compliant decision-token pair (mirrors DSFR's accentuation badges).
	 * `ready` has no badge.
	 */
	badge?: { label: string; color: string; bgColor: string };
	heading: string;
	body: string;
	actions: StateAction[];
};

/** True when any Section carries the AI `toVerify` flag (per-Section, see CONTEXT.md). */
function hasUnverifiedAiContent(declaration: PopulatedDeclaration): boolean {
	return (
		declaration.audit?.toVerify === true ||
		declaration.schema?.toVerify === true ||
		declaration.contact?.toVerify === true
	);
}

/**
 * Derives the {@link DeclarationState} as a switch on {@link Status}, sub-splitting
 * the draft branch on completeness then AI-verification. Returns `null` for a
 * clean published declaration (no notice). See CONTEXT.md "Declaration state".
 *
 * `to-verify` is defined but dormant in v1 — it can only be reached once AI
 * prefill sets a `toVerify` flag on a complete draft.
 */
export function getDeclarationState(
	declaration: PopulatedDeclaration,
): DeclarationState | null {
	switch (getDeclarationStatus(declaration)) {
		case "published":
			return null;
		case "modified":
			return "published-modified";
		case "draft":
			if (hasUnverifiedAiContent(declaration)) return "to-verify";
			if (validateDeclaration(declaration).length > 0) return "incomplete";
			return "ready";
	}
}

/**
 * Static presentation per state — colours, copy, and the ordered action flags.
 * Handlers live in the component, not here. Copy is verbatim from Figma.
 *
 * Badge colour pairs reuse DSFR's accentuation-badge tokens
 * (`text.label.<family>` on `background.contrast.<family>`), which are
 * validated for RGAA contrast.
 */
export const STATE_PRESENTATION: Record<DeclarationState, StatePresentation> = {
	incomplete: {
		bgColor: fr.colors.decisions.background.alt.purpleGlycine.default,
		badge: {
			label: "À compléter",
			color: fr.colors.decisions.text.label.purpleGlycine.default,
			bgColor: fr.colors.decisions.background.contrast.purpleGlycine.default,
		},
		heading: "Votre déclaration est incomplète.",
		body: 'Certaines informations sont nécessaires pour pouvoir publier la déclaration. Veuillez renseigner les champs marqués "À compléter".',
		actions: [],
	},
	ready: {
		bgColor: fr.colors.decisions.background.alt.greenEmeraude.default,
		heading: "Votre déclaration est prête à être publiée.",
		body: "Vous pouvez prévisualiser et publier pour la mettre en ligne.",
		actions: ["publish"],
	},
	"to-verify": {
		bgColor: fr.colors.decisions.background.alt.yellowTournesol.default,
		badge: {
			label: "À vérifier",
			color: fr.colors.decisions.text.label.yellowTournesol.default,
			bgColor: fr.colors.decisions.background.contrast.yellowTournesol.default,
		},
		heading: "Votre déclaration a été pré-remplie automatiquement.",
		body: "Nous vous invitons à vérifier l'ensemble des informations renseignées ci-dessous avant de publier.",
		actions: ["publish"],
	},
	"published-modified": {
		bgColor: fr.colors.decisions.background.alt.orangeTerreBattue.default,
		badge: {
			label: "Modifié",
			color: fr.colors.decisions.text.label.orangeTerreBattue.default,
			bgColor:
				fr.colors.decisions.background.contrast.orangeTerreBattue.default,
		},
		heading: "Votre déclaration est publiée mais a été modifiée.",
		body: "Des modifications ont été réalisées depuis la dernière publication. Vous pouvez prévisualiser et publier pour mettre à jour.",
		actions: ["revert", "publish"],
	},
};

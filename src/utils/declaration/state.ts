import { fr } from "@codegouvfr/react-dsfr";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { getDeclarationStatus } from "./status";
import { validateDeclaration } from "./validateDeclaration";

/**
 * Derived state answering "what should the declarant do next?". Distinct from
 * {@link Status}: it folds completeness and AI-verification on top of the pure
 * lifecycle. `null` renders no notice.
 */
export type DeclarationState =
	| "incomplete"
	| "to-verify"
	| "ready"
	| "published-incomplete"
	| "published-modified";

/** Actions a notice may expose, in render order. Handlers are wired by the component. */
export type StateAction = "revert" | "publish";

/** Badge variants surfaced on `SideMenu` items. `modified` is not rendered yet. */
export type BadgeVariant = "to-complete" | "to-verify" | "modified";

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

/** True when any Section carries the AI `toVerify` flag. */
function hasUnverifiedAiContent(declaration: PopulatedDeclaration): boolean {
	return (
		declaration.audit?.toVerify === true ||
		declaration.schema?.toVerify === true ||
		declaration.contact?.toVerify === true
	);
}

/**
 * Derives the {@link DeclarationState} as a switch on {@link Status}, sub-splitting
 * the editable branches (draft / modified) on completeness then AI-verification.
 * The modified branch can be incomplete too: removing a Contact or Schema from a
 * published declaration yields `published-incomplete`.
 */
export function getDeclarationState(
	declaration: PopulatedDeclaration,
): DeclarationState | null {
	switch (getDeclarationStatus(declaration)) {
		case "published":
			return null;
		case "modified":
			if (validateDeclaration(declaration).length > 0)
				return "published-incomplete";
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
	"published-incomplete": {
		bgColor: fr.colors.decisions.background.alt.purpleGlycine.default,
		badge: {
			label: "À compléter",
			color: fr.colors.decisions.text.label.purpleGlycine.default,
			bgColor: fr.colors.decisions.background.contrast.purpleGlycine.default,
		},
		heading: "Votre déclaration est publiée mais incomplète.",
		body: 'Une information nécessaire à la publication a été retirée. Veuillez renseigner les champs marqués "À compléter" pour pouvoir republier, ou revenir à la dernière version publiée.',
		actions: ["revert"],
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

/** Per-Section badge presentation, reusing the matching state's badge. */
export const SECTION_BADGE: Record<
	BadgeVariant,
	NonNullable<StatePresentation["badge"]>
> = {
	"to-complete": STATE_PRESENTATION.incomplete.badge!,
	"to-verify": STATE_PRESENTATION["to-verify"].badge!,
	modified: STATE_PRESENTATION["published-modified"].badge!,
};

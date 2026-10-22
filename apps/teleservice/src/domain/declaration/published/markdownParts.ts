import { appKindOptions } from "~/payload/selectOptions";
import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { obsoleteSince } from "~/domain/declaration/obsolescence";

/** Snapshot dates are calendar dates (YYYY-MM-DD), as the Zod contract enforces. */
export type IsoDate = string;

export const DEFENSEUR_URL =
	"https://formulaire.defenseurdesdroits.fr/formulaire_saisine/";
export const DELEGUE_URL = "https://www.defenseurdesdroits.fr/saisir/delegues";
export const ARCOM_URL =
	"https://www.arcom.fr/signaler-ou-alerter/probleme-accessibilite";

export const formatFrDate = (date: IsoDate): string => {
	const [year, month, day] = date.split("-");
	return `${day}/${month}/${year}`;
};

export const obsoleteSinceDay = (publishedAt: IsoDate): IsoDate =>
	obsoleteSince(new Date(publishedAt)).toISOString().slice(0, 10);

export const hasText = (value: string | null | undefined): value is string =>
	!!value && value.trim().length > 0;

export const badge = (label: string, severity: "success" | "info" | "error") =>
	`<p class="fr-badge fr-badge--${severity} fr-badge--sm fr-badge--no-icon">${label}</p>`;

export const CONFORMITY_BADGE_SEVERITY: Record<
	string,
	"success" | "info" | "error"
> = {
	Conforme: "success",
	"Partiellement conforme": "info",
	"Non conforme": "error",
};

export const appKindOf = (appKindLabel: PublishedDeclaration["appKindLabel"]) =>
	appKindOptions.find((o) => o.label === appKindLabel)?.value;

export const serviceSubject = (
	appKindLabel: PublishedDeclaration["appKindLabel"],
) => {
	switch (appKindOf(appKindLabel)) {
		case "website":
			return "Le site";
		case "mobile_app":
			return "L’application mobile";
		default:
			return "Le service";
	}
};

export const serviceName = (d: PublishedDeclaration) =>
	`**${[d.name, d.url].filter(hasText).join(" ")}**`;

export const rgaaVersionNumber = (label: string) =>
	label.replace(/^RGAA\s*/, "");

export const bulletList = (items: string[]) => items.map((item) => `- ${item}`);

export const section = (heading: string, ...lines: (string | null)[]) => [
	heading,
	"",
	...lines.filter((line): line is string => line !== null),
	"",
];

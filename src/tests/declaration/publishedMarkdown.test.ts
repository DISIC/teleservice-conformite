import { describe, expect, it } from "vitest";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import {
	buildPublishedMarkdown,
	isObsolete,
	obsoleteSince,
	publicationLabel,
} from "~/utils/declaration/publishedMarkdown";

const TODAY = new Date("2026-09-07T12:00:00.000Z");

/** The Figma reference declaration: full audit, schema links, both contact channels. */
function publishedDeclaration(
	overrides: Partial<PublishedDeclaration> = {},
): PublishedDeclaration {
	return {
		name: "Impôts particulier (SIP)",
		entityName: "La Direction Générale des Finances (DGFIP)",
		schema: {
			schemaName: "Schéma pluriannuel de mise en accessibilité 2023-2025",
			schemaUrl: "https://www.lienschemapluriannuel.gouv.fr",
			actionPlanUrls: [
				{
					name: "Actions réalisées en 2022-2023",
					url: "https://www.liensactions.gouv.fr",
				},
				{
					name: "Plan d’actions 2023-2025",
					url: "https://www.lienschemaannuell.gouv.fr",
				},
			],
		},
		appKindLabel: "Site web",
		url: "www.impotspparticulier.gouv.fr",
		firstPublishedAt: "2025-03-24",
		publishedAt: "2025-03-27",
		audit: {
			isRealised: true,
			rgaa_version: "RGAA 5",
			realised_by: "Orion audit",
			rate: 74,
			nonCompliantElements: [
				"- La vidéo de présentation de la demande d’aide n’a pas de transcription.",
				"- Le bouton d’envoi du formulaire de déclaration contient un intitulé « Retour » au lieu de « Envoi »",
			].join("\n"),
			disproportionnedCharge:
				"Les archives des comptes rendus des séances du conseil municipal jusqu’en 2010 sont au format PDF image.",
			optionalElements:
				"Cartes de l’Institut géographique national associées à l’annuaire",
			compliantElements: [
				"- page d’accueil : https://www.lienschemaannuell.gouv.fr",
				"- page contact : https://www.lienschemaannuell.gouv.fr",
			].join("\n"),
			technologies: [{ name: "HTML" }],
			testEnvironments: ["Firefox et NVDA", "Safari et VoiceOver"],
			usedTools: ["NVDA", "Web Developer Toolbar"],
		},
		contact: {
			url: "https://www.impots/formulairecontact.gouv.fr",
			email: "contact@impotsparticuliers.com",
		},
		...overrides,
	};
}

const snapshot = (name: string) =>
	`./__snapshots__/publishedMarkdown/${name}.md`;

describe("buildPublishedMarkdown", () => {
	it("renders the full, republished declaration", async () => {
		await expect(
			buildPublishedMarkdown(publishedDeclaration(), { today: TODAY }),
		).toMatchFileSnapshot(snapshot("full-republished"));
	});

	it("renders a declaration whose audit was not performed", async () => {
		await expect(
			buildPublishedMarkdown(
				publishedDeclaration({
					firstPublishedAt: "2026-08-27",
					publishedAt: "2026-08-27",
					audit: {
						isRealised: false,
						rgaa_version: "RGAA 4",
						realised_by: "",
						rate: 0,
						nonCompliantElements: "",
						disproportionnedCharge: "",
						optionalElements: "",
						compliantElements: "",
						technologies: [],
						testEnvironments: [],
						usedTools: [],
					},
				}),
				{ today: TODAY },
			),
		).toMatchFileSnapshot(snapshot("no-audit"));
	});

	it("renders an obsolete declaration", async () => {
		await expect(
			buildPublishedMarkdown(
				publishedDeclaration({
					firstPublishedAt: "2023-03-24",
					publishedAt: "2023-03-24",
				}),
				{ today: TODAY },
			),
		).toMatchFileSnapshot(snapshot("obsolete"));
	});

	it("is deterministic for a given day", () => {
		const a = buildPublishedMarkdown(publishedDeclaration(), { today: TODAY });
		const b = buildPublishedMarkdown(publishedDeclaration(), { today: TODAY });
		expect(a).toBe(b);
	});

	describe("dates sentence", () => {
		it("states only the establishment date on a first publication", () => {
			const md = buildPublishedMarkdown(
				publishedDeclaration({
					firstPublishedAt: "2026-08-27",
					publishedAt: "2026-08-27",
				}),
				{ today: TODAY },
			);
			expect(md).toContain(
				"Cette déclaration a été établie le **27/08/2026**.\n",
			);
			expect(md).not.toContain("mise à jour");
		});

		it("adds the update date once republished", () => {
			expect(
				buildPublishedMarkdown(publishedDeclaration(), { today: TODAY }),
			).toContain(
				"établie le **24/03/2025**. Elle a été mise à jour le **27/03/2025**.",
			);
		});
	});

	describe("conformity", () => {
		it("badges the conformity status from the audit rate", () => {
			expect(
				buildPublishedMarkdown(publishedDeclaration(), { today: TODAY }),
			).toContain(
				'<p class="fr-badge fr-badge--info fr-badge--sm fr-badge--no-icon">Partiellement conforme</p>',
			);
			expect(
				buildPublishedMarkdown(
					publishedDeclaration({
						audit: { ...publishedDeclaration().audit, rate: 100 },
					}),
					{ today: TODAY },
				),
			).toContain("fr-badge--success");
		});

		it("deems an obsolete declaration non compliant whatever its rate", () => {
			const md = buildPublishedMarkdown(
				publishedDeclaration({
					firstPublishedAt: "2023-03-24",
					publishedAt: "2023-03-24",
				}),
				{ today: TODAY },
			);
			expect(md).toContain("est réputé **non conforme**");
			expect(md).toContain("Elle est obsolète depuis le **24/03/2026**.");
			expect(md).toContain('<div class="declaration-obsolete">');
			expect(md).toContain("74%");
		});

		it("omits every audit-derived section when no audit was performed", () => {
			const md = buildPublishedMarkdown(
				publishedDeclaration({
					audit: { ...publishedDeclaration().audit, isRealised: false },
				}),
				{ today: TODAY },
			);
			expect(md).toContain(
				"n’a pas fait l’objet d’un audit de conformité et est réputé **non conforme**",
			);
			expect(md).not.toContain("Résultats des tests");
			expect(md).not.toContain("Contenus non accessibles");
			expect(md).not.toContain("Environnement de test");
			expect(md).not.toContain("Pages du site");
		});
	});

	describe("scope sentence", () => {
		it("names the service type", () => {
			expect(
				buildPublishedMarkdown(publishedDeclaration(), { today: TODAY }),
			).toContain("s’applique au **site web www.impotspparticulier.gouv.fr**");
		});

		it("omits the catch-all « Autre »", () => {
			const md = buildPublishedMarkdown(
				publishedDeclaration({ appKindLabel: "Autre" }),
				{ today: TODAY },
			);
			expect(md).toContain("s’applique à **www.impotspparticulier.gouv.fr**");
			expect(md).not.toContain("Autre");
			expect(md).toContain("Le service **Impôts particulier (SIP)");
		});
	});

	it("labels unnamed schema links with a generic name", () => {
		const md = buildPublishedMarkdown(
			publishedDeclaration({
				schema: {
					schemaName: "",
					schemaUrl: "https://schema.gouv.fr",
					actionPlanUrls: [{ name: "", url: "https://plan.gouv.fr" }],
				},
			}),
			{ today: TODAY },
		);
		expect(md).toContain(
			"- **Schéma pluriannuel de mise en accessibilité** : https://schema.gouv.fr ;",
		);
		expect(md).toContain("- **Plan d’actions** : https://plan.gouv.fr");
	});
});

describe("obsolescence", () => {
	it("starts three years after the last publication", () => {
		expect(obsoleteSince("2023-03-24")).toBe("2026-03-24");
		expect(isObsolete("2023-03-24", new Date("2026-03-24T23:00:00Z"))).toBe(
			false,
		);
		expect(isObsolete("2023-03-24", new Date("2026-03-25T00:00:00Z"))).toBe(
			true,
		);
	});
});

describe("publicationLabel", () => {
	it("says « Publiée le » on a first publication", () => {
		expect(
			publicationLabel({
				firstPublishedAt: "2026-08-27",
				publishedAt: "2026-08-27",
			}),
		).toBe("Publiée le 27/08/2026");
	});

	it("says « Mise à jour » once republished", () => {
		expect(
			publicationLabel({
				firstPublishedAt: "2025-03-24",
				publishedAt: "2026-08-27",
			}),
		).toBe("Mise à jour : 27/08/2026");
	});
});

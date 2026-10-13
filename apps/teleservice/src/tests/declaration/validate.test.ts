import { describe, expect, it } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import { validateDeclaration } from "~/domain/declaration/validate";

const errorsFor = (
	errors: ReturnType<typeof validateDeclaration>,
	section: string,
) => errors.filter((e) => e.section === section);

describe("validateDeclaration", () => {
	it("returns no errors for a complete declaration", () => {
		expect(validateDeclaration(completeDeclaration())).toEqual([]);
	});

	it("walks Sections in SideMenu order — infos errors come first", () => {
		const errors = validateDeclaration(
			completeDeclaration({
				name: null,
				entity: null,
				audit: {},
				schema: {},
				contact: {},
			} as never),
		);
		expect(errors[0]?.section).toBe("infos");
	});

	it("blocks publishing while the service type is unset", () => {
		const errors = errorsFor(
			validateDeclaration(completeDeclaration({ app_kind: null } as never)),
			"infos",
		);
		expect(errors).toEqual([
			{
				section: "infos",
				field: "general.kind",
				label: "Type de service",
				message: "Le type de service est requis",
			},
		]);
	});

	it("requires the initial publication date whatever the creation path", () => {
		for (const fromSource of ["manual", "ara", "ai"] as const) {
			expect(
				errorsFor(
					validateDeclaration(
						completeDeclaration({ fromSource, first_published_at: null }),
					),
					"infos",
				),
			).toEqual([
				{
					section: "infos",
					field: "general.firstPublishedAt",
					label: "Date de publication initiale de la déclaration",
					message: "La date de publication initiale est requise",
				},
			]);
		}
		expect(
			errorsFor(
				validateDeclaration(
					completeDeclaration({
						fromSource: "manual",
						first_published_at: "2024-03-24T00:00:00.000Z",
					}),
				),
				"infos",
			),
		).toEqual([]);
	});

	it("rejects an initial publication date in the future", () => {
		expect(
			errorsFor(
				validateDeclaration(
					completeDeclaration({
						first_published_at: "2999-01-01T00:00:00.000Z",
					}),
				),
				"infos",
			),
		).toEqual([
			{
				section: "infos",
				field: "general.firstPublishedAt",
				label: "Date de publication initiale de la déclaration",
				message:
					"La date de publication initiale ne peut pas être postérieure à la date du jour",
			},
		]);
	});

	it("rejects an implausibly old initial publication date as invalid", () => {
		expect(
			errorsFor(
				validateDeclaration(
					completeDeclaration({
						first_published_at: "0030-01-20T00:00:00.000Z",
					}),
				),
				"infos",
			).map((e) => e.message),
		).toEqual(["Date invalide"]);
	});

	it("requires the platform once the service is a mobile app", () => {
		const errors = errorsFor(
			validateDeclaration(
				completeDeclaration({
					app_kind: "mobile_app",
					mobile_platform: null,
				} as never),
			),
			"infos",
		);
		expect(errors).toEqual([
			{
				section: "infos",
				field: "general.mobilePlatform",
				label: "Plateforme mobile",
				message: "La plateforme mobile est requise",
			},
		]);
	});

	it("emits a single radio-targeting error while a source mode is Undecided", () => {
		const errors = validateDeclaration(
			completeDeclaration({ contact: {} } as never),
		);
		expect(errorsFor(errors, "contact")).toEqual([
			{
				section: "contact",
				field: "contact.sourceMode",
				message: "Sélectionnez une option pour le contact",
			},
		]);
	});

	it("requires deciding the schema source mode too — Skipped is a choice", () => {
		const errors = validateDeclaration(
			completeDeclaration({ schema: {} } as never),
		);
		expect(errorsFor(errors, "schema")).toEqual([
			{
				section: "schema",
				field: "schema.sourceMode",
				message: "Sélectionnez une option pour le schéma pluriannuel",
			},
		]);
	});

	it("switches to field-level errors once content marks the section Custom", () => {
		const errors = errorsFor(
			validateDeclaration(
				completeDeclaration({
					contact: { name: "Référent", email: "pas-un-email" },
				} as never),
			),
			"contact",
		);
		expect(errors).toEqual([
			{
				section: "contact",
				field: "email",
				label: "Email de contact",
				message: "Email invalide",
			},
		]);
	});

	it("skips an inapplicable schema section entirely when Skipped", () => {
		const errors = validateDeclaration(
			completeDeclaration({
				schema: { skipped: true, url: "invalide" },
			} as never),
		);
		expect(errorsFor(errors, "schema")).toEqual([]);
	});

	it("asks only the realisation question when the audit is not realised", () => {
		const errors = validateDeclaration(
			completeDeclaration({ audit: { isRealised: false } } as never),
		);
		expect(errors.filter((e) => e.section.startsWith("audit"))).toEqual([]);
	});

	it("opens the three realised-only Sub-sections once the audit is realised", () => {
		const errors = validateDeclaration(
			completeDeclaration({ audit: { isRealised: true, rate: 42 } } as never),
		);
		expect(errorsFor(errors, "audit-general")).toEqual([
			{
				section: "audit-general",
				field: "realisedBy",
				label: "Entité ou personne ayant réalisé l’audit",
				message: "L'organisation ayant réalisé l'audit est requise",
			},
		]);
		expect(errorsFor(errors, "audit-contenus")).toEqual([
			{
				section: "audit-contenus",
				field: "compliantElements",
				label: "Éléments ayant fait l’objet de la vérification de conformité",
				message: "Les éléments conformes sont requis",
			},
		]);
		expect(errorsFor(errors, "audit-outils")).toEqual([
			{
				section: "audit-outils",
				field: "usedTools",
				label: "Liste des outils utilisés pour évaluer l’accessibilité",
				message: "Au moins un outil d'assistance est requis",
			},
			{
				section: "audit-outils",
				field: "testEnvironments",
				label: "Liste des environnements utilisés pour évaluer l’accessibilité",
				message: "Au moins un environnement de test est requis",
			},
		]);
		// Non-conformités stay all-optional: applicable yet error-free.
		expect(errorsFor(errors, "audit-non-conformites")).toEqual([]);
	});

	it("rejects an audit date in the future", () => {
		const errors = validateDeclaration(
			completeDeclaration({
				audit: { isRealised: true, date: "2999-01-01T00:00:00.000Z" },
			} as never),
		);
		expect(
			errorsFor(errors, "audit-general").filter((e) => e.field === "date"),
		).toEqual([
			{
				section: "audit-general",
				field: "date",
				label: "Date de réalisation de l’audit",
				message:
					"La date de réalisation de l'audit ne peut pas être postérieure à la date du jour",
			},
		]);
	});

	it("validates the persisted row, so an unanswered audit blocks publish", () => {
		const errors = validateDeclaration(
			completeDeclaration({ audit: {} } as never),
		);
		expect(errorsFor(errors, "audit-general")).toEqual([
			{
				section: "audit-general",
				field: "isAuditRealised",
				label:
					"Avez-vous réalisé un audit d’accessibilité de votre service numérique ?",
				message: "La question de la réalisation de l'audit est requise",
			},
		]);
	});

	it("labels each field so errors sharing a message stay distinct", () => {
		const errors = errorsFor(
			validateDeclaration(
				completeDeclaration({ contact: { name: "Référent" } } as never),
			),
			"contact",
		);
		expect(errors.map((e) => e.label)).toEqual([
			"Email de contact",
			"Lien URL du formulaire",
		]);
	});

	it("numbers array items from 1 in their label", () => {
		const errors = errorsFor(
			validateDeclaration(
				completeDeclaration({
					schema: {
						name: "Schéma 2024",
						actionPlanUrls: [
							{ name: "Plan 2024", url: "https://example.fr" },
							{ name: "", url: "https://example.fr" },
						],
					},
				} as never),
			),
			"schema",
		);
		expect(errors).toEqual([
			{
				section: "schema",
				field: "actionPlanUrls.1.name",
				label: "Nom du plan d'actions 2",
				message: "Le nom du plan d'actions est requis",
			},
		]);
	});

	it("drops a saved custom draft's errors once Linked is chosen but not picked", () => {
		const declaration = completeDeclaration({
			contact: { email: "contact@example.fr" },
		} as never);
		expect(
			errorsFor(
				validateDeclaration(declaration, { contact: "linked" }),
				"contact",
			),
		).toEqual([
			{
				section: "contact",
				field: "contact.parent",
				message: "Sélectionnez un contact existant",
			},
		]);
	});

	it("runs the field schema once Custom is chosen, even before anything is typed", () => {
		const errors = errorsFor(
			validateDeclaration(completeDeclaration({ contact: {} } as never), {
				contact: "custom",
			}),
			"contact",
		);
		expect(errors.map((e) => e.field)).toEqual(["name", "email", "url"]);
	});

	it("still asks for an item when Linked replaces a Skipped schema", () => {
		const errors = errorsFor(
			validateDeclaration(
				completeDeclaration({ schema: { skipped: true } } as never),
				{ schema: "linked" },
			),
			"schema",
		);
		expect(errors.map((e) => e.message)).toEqual([
			"Sélectionnez un schéma pluriannuel existant",
		]);
	});

	it("runs the field schema when Custom replaces a Skipped schema", () => {
		const errors = errorsFor(
			validateDeclaration(
				completeDeclaration({ schema: { skipped: true } } as never),
				{ schema: "custom" },
			),
			"schema",
		);
		expect(errors.map((e) => e.field)).toEqual(["name"]);
	});
});

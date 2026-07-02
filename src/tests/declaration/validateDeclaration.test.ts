import { describe, expect, it } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import { validateDeclaration } from "~/utils/declaration/validateDeclaration";

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
			{ section: "contact", field: "email", message: "Email invalide" },
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
				message: "L'organisation ayant réalisé l'audit est requise",
			},
		]);
		expect(errorsFor(errors, "audit-contenus")).toEqual([
			{
				section: "audit-contenus",
				field: "compliantElements",
				message: "Les éléments conformes sont requis",
			},
		]);
		// Tools and non-conformités are all-optional: applicable yet error-free.
		expect(errorsFor(errors, "audit-outils")).toEqual([]);
		expect(errorsFor(errors, "audit-non-conformites")).toEqual([]);
	});

	it("validates the persisted row, so an unanswered audit blocks publish", () => {
		const errors = validateDeclaration(
			completeDeclaration({ audit: {} } as never),
		);
		expect(errorsFor(errors, "audit-general")).toEqual([
			{
				section: "audit-general",
				field: "isAuditRealised",
				message: "La question de la réalisation de l'audit est requise",
			},
		]);
	});
});

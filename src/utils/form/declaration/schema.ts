import z from "zod";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";

export const declarationGeneral = z.object({
	organisation: z
		.string()
		.meta({ kind: "select" })
		.min(1, { message: "Le nom de l'organisation est requis" }),
	appKind: z.enum(appKindOptions.map((option) => option.value)),
	appName: z.string().min(1, { message: "Le nom de l'application est requis" }),
	appUrl: z.url(),
	domain: z
		.string()
		.meta({ kind: "select" })
		.min(1, { message: "Le domaine est requis" }),
	// hasMultiYearSchema: z.boolean(),
	// linkMultiYearSchema: z.url().optional(),
	// uploadMultiYearSchema: z.file().optional(),
});

type ZDeclarationGeneral = z.infer<typeof declarationGeneral>;

export const declarationGeneralDefaultValues: ZDeclarationGeneral = {
	organisation: "",
	appKind: "website",
	appName: "",
	appUrl: "",
	domain: "",
	// hasMultiYearSchema: false,
	// linkMultiYearSchema: undefined,
	// uploadMultiYearSchema: undefined,
};

export const declarationAudit = z.object({
	isAchieved: z.boolean(),
	url: z.url(),
	date: z.date(),
	report: z.file().optional(),
	matrix: z.file().optional(),
	realisedBy: z.string(),
	rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
	rate: z.number().min(0).max(100),
	technologies: z.array(z.string()).min(1, {
		message: "Au moins une technologie doit être sélectionnée",
	}),
	testEnvironnements: z
		.array(z.object({ kind: z.string(), os: z.string() }))
		.min(1, {
			message: "Au moins un environnement de test doit être sélectionné",
		}),
	pages: z
		.array(z.object({ label: z.string(), url: z.url() }))
		.min(1, { message: "Au moins une page doit être renseignée" }),
});

type ZDeclarationAudit = z.infer<typeof declarationAudit>;

export const declarationAuditDefaultValues: ZDeclarationAudit = {
	isAchieved: false,
	url: "",
	date: new Date(),
	report: undefined,
	matrix: undefined,
	realisedBy: "",
	rgaa_version: "rgaa_4",
	rate: 0,
	technologies: [],
	testEnvironnements: [],
	pages: [{ label: "", url: "" }],
};

export const declarationContact = z.object({
	contactName: z.string(),
	contactEmail: z.email(),
	contactPhone: z.string().optional(),
});

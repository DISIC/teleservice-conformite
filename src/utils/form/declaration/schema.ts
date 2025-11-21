import z from "zod";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";

export const declarationGeneral = z.object({
	organisation: z
		.string()
		.meta({ kind: "select" })
		.min(1, { message: "Le nom de l'organisation est requis" }),
	kind: z.enum(appKindOptions.map((option) => option.value)),
	name: z.string().min(1, { message: "Le nom de l'application est requis" }),
	appUrl: z.url(),
	domain: z
		.string()
		.meta({ kind: "select" })
		.min(1, { message: "Le domaine est requis" }),
	// hasMultiYearSchema: z.boolean(),
	// linkMultiYearSchema: z.url().optional(),
	// uploadMultiYearSchema: z.file().optional(),
});

export type ZDeclarationGeneral = z.infer<typeof declarationGeneral>;

export const declarationGeneralDefaultValues: ZDeclarationGeneral = {
	organisation: "",
	kind: "website",
	name: "",
	appUrl: "",
	domain: "",
	// hasMultiYearSchema: false,
	// linkMultiYearSchema: undefined,
	// uploadMultiYearSchema: undefined,
};

export const declarationAudit = z.object({
	isAchieved: z.boolean(),
	url: z
		.url({ error: "L'URL n'est pas valide" })
		.min(1, { message: "L'URL est requise" }),
	date: z.iso.date().min(1, { message: "La date est requise" }),
	report: z.file().optional(),
	matrix: z.file().optional(),
	realisedBy: z.string().min(1, {
		message: "L'organisation ayant réalisé l'audit est requise",
	}),
	rgaa_version: z.enum(rgaaVersionOptions.map((option) => option.value)),
	rate: z
		.number()
		.min(0, { message: "Le taux doit être entre 0 et 100" })
		.max(100, { message: "Le taux doit être entre 0 et 100" }),
	pages: z
		.array(z.object({ label: z.string(), url: z.url() }))
		.min(1, { message: "Au moins une page doit être renseignée" }),
	technologies: z.array(z.string()).min(1, {
		message: "Au moins une technologie doit être sélectionnée",
	}),
	testEnvironments: z
		.array(z.object({ kind: z.string(), os: z.string() }))
		.min(1, {
			message: "Au moins un environnement de test doit être sélectionné",
		}),
	tools: z.array(z.string()).min(1, {
		message: "Au moins un outil doit être sélectionné",
	}),
});

export type ZDeclarationAudit = z.infer<typeof declarationAudit>;

export const declarationAuditDefaultValues: ZDeclarationAudit = {
	isAchieved: false,
	url: "",
	date: "",
	report: undefined,
	matrix: undefined,
	realisedBy: "",
	rgaa_version: "rgaa_4",
	rate: 0,
	pages: [{ label: "", url: "" }],
	technologies: [],
	testEnvironments: [{ kind: "", os: "" }],
	tools: [],
};

export const declarationContact = z.object({
	contactName: z.string(),
	contactEmail: z.email(),
	contactPhone: z.string().optional(),
});

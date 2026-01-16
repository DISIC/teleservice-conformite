import { formOptions } from "@tanstack/react-form";
import z from "zod";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";

export const declarationGeneral = z.object({
	general: z.object({
		organisation: z
			.string()
			.meta({ kind: "select" })
			.min(1, { message: "Le nom de l'organisation est requis" }),
		kind: z.enum(appKindOptions.map((option) => option.value)),
		name: z.string().min(1, { message: "Le nom de l'application est requis" }),
		url: z.union([z.url({ error: "L'URL n'est pas valide" }), z.literal("")]),
		domain: z
			.string()
			.meta({ kind: "select" })
			.min(1, { message: "Le domaine est requis" }),
	}),
});

export type ZDeclarationGeneral = z.infer<typeof declarationGeneral>;

export const declarationGeneralDefaultValues: ZDeclarationGeneral = {
	general: {
		organisation: "",
		kind: "website",
		name: "",
		url: "",
		domain: "",
	},
};

export const declarationAudit = z.object({
	audit: z.object({
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
	}),
});

export type ZDeclarationAudit = z.infer<typeof declarationAudit>;

export const declarationAuditDefaultValues: ZDeclarationAudit = {
	audit: {
		url: "",
		date: "",
		report: undefined,
		matrix: undefined,
		realisedBy: "",
		rgaa_version: "rgaa_4",
		rate: 0,
		pages: [{ label: "", url: "" }],
		technologies: [""],
		testEnvironments: [{ kind: "", os: "" }],
		tools: [""],
	},
};

export const initialDeclaration = z.object({
	initialDeclaration: z.object({
		isNewDeclaration: z.boolean(),
		publishedDate: z.iso.date().optional(),
		araUrl: z.union([z.url().optional(), z.literal("")]),
	}),
});

export type ZInitialDeclaration = z.infer<typeof initialDeclaration>;

export const initialDeclarationDefaultValues: ZInitialDeclaration = {
	initialDeclaration: {
		isNewDeclaration: false,
		publishedDate: undefined,
		araUrl: "",
	},
};

export const declarationContact = z.object({
	contactName: z.string(),
	contactEmail: z.email(),
	contactPhone: z.string().optional(),
});

export const declarationMultiStepFormSchema = z.object({
	section: z.enum(["general", "audit", "schema", "initialDeclaration"]),
	...declarationGeneral.shape,
	...declarationAudit.shape,
	...initialDeclaration.shape,
});

export type ZDeclarationMultiStepFormSchema = z.infer<
	typeof declarationMultiStepFormSchema
>;

const defaultValues: ZDeclarationMultiStepFormSchema = {
	section: "general",
	...declarationGeneralDefaultValues,
	...declarationAuditDefaultValues,
	...initialDeclarationDefaultValues,
};

export const declarationMultiStepFormOptions = formOptions({
	defaultValues,
	validators: {
		onSubmit: ({ value, formApi }) => {
			if (value.section === "general") {
				return formApi.parseValuesWithSchema(
					declarationGeneral as typeof declarationMultiStepFormSchema,
				);
			}

			if (value.section === "audit") {
				return formApi.parseValuesWithSchema(
					declarationAudit as typeof declarationMultiStepFormSchema,
				);
			}

			if (value.section === "initialDeclaration") {
				return formApi.parseValuesWithSchema(
					initialDeclaration as typeof declarationMultiStepFormSchema,
				);
			}
		},
	},
});

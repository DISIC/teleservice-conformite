import { formOptions } from "@tanstack/react-form";
import z from "zod";
import { appKindOptions, rgaaVersionOptions } from "~/payload/selectOptions";

export const declarationGeneral = z.object({
	general: z.object({
		organisation: z
			.string()
			.meta({ kind: "select" })
			.min(1, { message: "Le nom de l'organisation est requis" }),
		kind: z.enum(appKindOptions.map((option) => option.value)),
		name: z.string().min(1, { message: "Le nom de l'application est requis" }),
		url: z.string().optional(),
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
		url: undefined,
		domain: "",
	},
};

export const initialDeclaration = z.object({
	initialDeclaration: z.object({
		newDeclaration: z.string().optional(),
		publishedDate: z.iso.date().optional(),
		araUrl: z.string().optional(),
		declarationUrl: z.string().optional(),
	}),
});

export type ZInitialDeclaration = z.infer<typeof initialDeclaration>;

export const initialDeclarationDefaultValues: ZInitialDeclaration = {
	initialDeclaration: {
		newDeclaration: "",
		publishedDate: undefined,
		araUrl: undefined,
		declarationUrl: undefined,
	},
};

export const declarationMultiStepFormSchema = z.object({
	section: z.enum(["general", "initialDeclaration"]),
	...declarationGeneral.shape,
	...initialDeclaration.shape,
});

export type ZDeclarationMultiStepFormSchema = z.infer<
	typeof declarationMultiStepFormSchema
>;

const defaultValues: ZDeclarationMultiStepFormSchema = {
	section: "general",
	...declarationGeneralDefaultValues,
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

			if (value.section === "initialDeclaration") {
				return formApi.parseValuesWithSchema(
					initialDeclaration as typeof declarationMultiStepFormSchema,
				);
			}
		},
	},
});

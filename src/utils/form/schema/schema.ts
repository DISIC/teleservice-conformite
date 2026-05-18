import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const schemaForm = z.object({
	schemaName: z.string().min(1, "Le nom du schéma est requis"),
	schemaUrl: z
		.url("Lien invalide (ex: https://www.example.fr)")
		.or(z.literal("")),
	actionPlanUrls: z.array(
		z.object({
			url: z.url("Lien invalide (ex: https://www.example.fr)"),
		}),
	),
});

export type ZSchema = z.infer<typeof schemaForm>;

export const schemaDefaultValues: ZSchema = {
	schemaName: "",
	schemaUrl: "",
	actionPlanUrls: [],
};

export const schemaFormOptions = formOptions({
	defaultValues: schemaDefaultValues,
	validators: {
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(schemaForm),
	},
});

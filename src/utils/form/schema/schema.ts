import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const schemaForm = z
	.object({
		hasDoneCurrentYearSchema: z.boolean(),
		currentYearSchemaUrl: z
			.url("Lien invalide (ex: https://www.example.fr)")
			.optional(),
		hasDonePreviousYearsSchema: z.boolean(),
		previousYearsSchemaUrl: z
			.url("Lien invalide (ex: https://www.example.fr)")
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.hasDoneCurrentYearSchema && !data.currentYearSchemaUrl) {
			ctx.addIssue({
				code: "custom",
				message: "L'URL du schéma de l'année en cours est requise",
				path: ["currentYearSchemaUrl"],
			});
		}
		if (data.hasDonePreviousYearsSchema && !data.previousYearsSchemaUrl) {
			ctx.addIssue({
				code: "custom",
				message: "L'URL du schéma des années précédentes est requise",
				path: ["previousYearsSchemaUrl"],
			});
		}
	});

export type ZSchema = z.infer<typeof schemaForm>;

export const schemaDefaultValues: ZSchema = {
	hasDoneCurrentYearSchema: false,
	currentYearSchemaUrl: undefined,
	hasDonePreviousYearsSchema: false,
	previousYearsSchemaUrl: undefined,
};

export const schemaFormOptions = formOptions({
	defaultValues: schemaDefaultValues,
	validators: {
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(schemaForm),
	},
});

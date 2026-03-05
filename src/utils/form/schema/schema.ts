import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const schemaForm = z.object({
	hasDoneCurrentYearSchema: z.boolean(),
	currentYearSchemaUrl: z
		.url("Lien invalide (ex: https://www.example.fr)")
		.optional()
		.or(z.literal("")),
	hasDonePreviousYearsSchema: z.boolean(),
	previousYearsSchemaUrl: z
		.url("Lien invalide (ex: https://www.example.fr)")
		.optional()
		.or(z.literal("")),
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

import z from "zod";
import { submitFormOptions } from "~/forms/formOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export const schemaForm = z.object({
	schemaName: z.string().min(1, "Le nom du schéma est requis"),
	schemaUrl: z
		.url("Lien invalide (ex: https://www.example.fr)")
		.or(z.literal("")),
	actionPlanUrls: z.array(
		z.object({
			name: z.string().min(1, "Le nom du plan d'actions est requis"),
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

export const schemaFormOptions = submitFormOptions(
	schemaDefaultValues,
	schemaForm,
);

/** Maps a persisted declaration to this form's values. Keep in sync with the
 *  schema above so the publish gate validates the exact shape the form feeds. */
export function declarationToSchemaValues(
	declaration: PopulatedDeclaration,
): ZSchema {
	if (!declaration.schema) return schemaDefaultValues;
	return {
		schemaName: declaration.schema.schemaName ?? "",
		schemaUrl: declaration.schema.schemaUrl ?? "",
		actionPlanUrls: (declaration.schema.actionPlanUrls ?? []).map((item) => ({
			name: item.name ?? "",
			url: item.url ?? "",
		})),
	};
}

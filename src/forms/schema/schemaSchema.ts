import z from "zod";
import { submitFormOptions } from "~/forms/formOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/** The schema field set with loose leaves — the single source of truth for
 *  which fields exist. Strict rules layer on top (`schemaForm`); the autosave
 *  draft (`schemaDraft`) loosens them. */
const schemaFields = z.object({
	name: z.string(),
	url: z.string(),
	actionPlanUrls: z.array(
		z.object({
			name: z.string(),
			url: z.string(),
		}),
	),
});

export const schemaForm = schemaFields.superRefine((data, ctx) => {
	if (!data.name)
		ctx.addIssue({
			code: "custom",
			path: ["name"],
			message: "Le nom du schéma est requis",
		});
	if (data.url && !z.url().safeParse(data.url).success)
		ctx.addIssue({
			code: "custom",
			path: ["url"],
			message: "Lien invalide (ex: https://www.example.fr)",
		});
	data.actionPlanUrls.forEach((item, index) => {
		if (!item.name)
			ctx.addIssue({
				code: "custom",
				path: ["actionPlanUrls", index, "name"],
				message: "Le nom du plan d'actions est requis",
			});
		if (!z.url().safeParse(item.url).success)
			ctx.addIssue({
				code: "custom",
				path: ["actionPlanUrls", index, "url"],
				message: "Lien invalide (ex: https://www.example.fr)",
			});
	});
});

/** Lenient autosave input: the schema field set with no required/format rules,
 *  so sequential autosave persists partial, in-progress values. Completeness is
 *  re-checked by `schemaForm` at the publish gate. */
export const schemaDraft = schemaFields.partial();

export type ZSchema = z.infer<typeof schemaForm>;

export const schemaDefaultValues: ZSchema = {
	name: "",
	url: "",
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
		name: declaration.schema.name ?? "",
		url: declaration.schema.url ?? "",
		actionPlanUrls: (declaration.schema.actionPlanUrls ?? []).map((item) => ({
			name: item.name ?? "",
			url: item.url ?? "",
		})),
	};
}

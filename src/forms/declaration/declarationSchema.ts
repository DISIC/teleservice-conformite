import z from "zod";
import { submitFormOptions } from "~/forms/formOptions";
import { appKindOptions, mobilePlatformOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export const declarationGeneral = z.object({
	general: z.object({
		organisation: z
			.string()
			.meta({ kind: "select" })
			.min(1, { message: "Le nom de l'organisation est requis" }),
		kind: z.enum(appKindOptions.map((option) => option.value)),
		mobilePlatform: z
			.enum(mobilePlatformOptions.map((option) => option.value))
			.optional(),
		name: z.string().min(1, { message: "Le nom de l'application est requis" }),
		url: z
			.url("Lien invalide (ex: https://www.example.fr)")
			.optional()
			.or(z.literal("")),
		domain: z
			.string()
			.meta({ kind: "select" })
			.min(1, { message: "Le domaine est requis" }),
	}),
});

export type ZDeclarationGeneral = z.infer<typeof declarationGeneral>;

// Refined variant used for form validation only. We keep `declarationGeneral`
// as a plain ZodObject so the router can still rely on `.shape`/`.extend`/`.omit`.
export const declarationGeneralRefined = declarationGeneral.superRefine(
	(data, ctx) => {
		if (data.general.kind === "mobile_app" && !data.general.mobilePlatform) {
			ctx.addIssue({
				code: "custom",
				message: "La plateforme mobile est requise",
				path: ["general", "mobilePlatform"],
			});
		}
	},
);

export const declarationGeneralDefaultValues: ZDeclarationGeneral = {
	general: {
		organisation: "",
		kind: "website",
		mobilePlatform: undefined,
		name: "",
		url: undefined,
		domain: "",
	},
};

export const declarationGeneralFormOptions = submitFormOptions(
	declarationGeneralDefaultValues,
	declarationGeneralRefined,
);

/** Maps a persisted declaration to this form's values. Keep in sync with the
 *  schema above so the publish gate validates the exact shape the form feeds. */
export function declarationToGeneralValues(
	declaration: PopulatedDeclaration,
): ZDeclarationGeneral {
	return {
		general: {
			organisation: declaration.entity?.name ?? "",
			kind: declaration.app_kind,
			mobilePlatform: declaration.mobile_platform ?? undefined,
			name: declaration.name ?? "",
			url: declaration.url ?? "",
			domain: declaration.entity?.kind ?? "",
		},
	};
}

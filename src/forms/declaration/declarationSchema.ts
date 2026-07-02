import z from "zod";
import { submitFormOptions } from "~/forms/formOptions";
import { optionalUrlIssue, requiredIssue } from "~/forms/rules";
import { appKindOptions, mobilePlatformOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

// Loose leaves shared by the strict form schema and the lenient autosave input;
// each layers its own rules on top.
const generalFields = z.object({
	organisation: z.string().meta({ kind: "select" }),
	kind: z.enum(appKindOptions.map((option) => option.value)),
	mobilePlatform: z
		.enum(mobilePlatformOptions.map((option) => option.value))
		.optional(),
	name: z.string(),
	url: z.string(),
	domain: z.string().meta({ kind: "select" }),
});

export const declarationGeneral = z.object({ general: generalFields });

export type ZDeclarationGeneral = z.infer<typeof declarationGeneral>;

export const declarationGeneralRefined = declarationGeneral.superRefine(
	(data, ctx) => {
		const g = data.general;
		requiredIssue(
			ctx,
			["general", "organisation"],
			g.organisation,
			"Le nom de l'organisation est requis",
		);
		requiredIssue(
			ctx,
			["general", "name"],
			g.name,
			"Le nom de l'application est requis",
		);
		requiredIssue(
			ctx,
			["general", "domain"],
			g.domain,
			"Le domaine est requis",
		);
		optionalUrlIssue(ctx, ["general", "url"], g.url);
		if (g.kind === "mobile_app" && !g.mobilePlatform)
			ctx.addIssue({
				code: "custom",
				path: ["general", "mobilePlatform"],
				message: "La plateforme mobile est requise",
			});
	},
);

export const declarationGeneralDefaultValues: ZDeclarationGeneral = {
	general: {
		organisation: "",
		kind: "website",
		mobilePlatform: undefined,
		name: "",
		url: "",
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

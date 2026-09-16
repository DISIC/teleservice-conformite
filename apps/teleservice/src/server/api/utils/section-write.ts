import type { Payload } from "payload";
import z from "zod";
import { NO_AUDIT } from "~/domain/declaration/published/noAudit";
import type { LibrarySectionKind } from "~/domain/declaration/sourceMode";
import {
	getDeclarationStatus,
	statusAfterEdit,
} from "~/domain/declaration/status";
import { contactDraft } from "~/forms/contact/contactSchema";
import { declarationGeneral } from "~/forms/declaration/declarationSchema";
import { schemaDraft } from "~/forms/schema/schemaSchema";
import type { Declaration } from "~/payload/payload-types";
import {
	getPopulatedDeclaration,
	type PopulatedDeclaration,
} from "./payload-helper";

/** The four data groups a Section save writes; Audit Sub-sections are slices of one. */
export type SectionKind = "infos" | "audit" | LibrarySectionKind;

// Any one Sub-section slice may arrive alone; `isRealised` is never inferred from other fields.
export const auditPatch = z.object({
	isRealised: z.boolean().optional(),
	date: z.iso.date().optional().or(z.literal("")),
	realisedBy: z.string().optional(),
	rgaa_version: z.enum(["rgaa_4", "rgaa_5"]).optional(),
	rate: z.number().nullable().optional(),
	compliantElements: z.string().optional(),
	nonCompliantElements: z.string().optional(),
	disproportionnedCharge: z.string().optional(),
	optionalElements: z.string().optional(),
	usedTools: z.array(z.string()).optional(),
	testEnvironments: z.array(z.string()).optional(),
	technologies: z.array(z.string()).optional(),
});

export const SECTION_PATCH = {
	infos: declarationGeneral.shape.general,
	audit: auditPatch,
	contact: contactDraft,
	schema: schemaDraft,
} as const satisfies Record<SectionKind, z.ZodType>;

export type SectionPatch<K extends SectionKind> = z.infer<
	(typeof SECTION_PATCH)[K]
>;

/** Row fields a save may write; relations are never touched here. */
export type DeclarationRowData = Partial<
	Omit<Declaration, "id" | "entity" | "created_by">
>;

type SectionMerger<K extends SectionKind> = (
	current: PopulatedDeclaration,
	patch: SectionPatch<K>,
) => DeclarationRowData;

const MERGERS: { [K in SectionKind]: SectionMerger<K> } = {
	infos: (current, general) => ({
		// Sequential autosave persists partials: a cleared required field keeps its saved value.
		...(general.name ? { name: general.name } : {}),
		...(general.kind
			? {
					app_kind: general.kind,
					mobile_platform:
						general.kind === "mobile_app" ? general.mobilePlatform : null,
				}
			: {}),
		url: general.url,
		// The initial publication date is frozen by the first publish action.
		...(general.firstPublishedAt && getDeclarationStatus(current) === "draft"
			? { first_published_at: general.firstPublishedAt }
			: {}),
	}),
	audit: (current, values) => {
		const { usedTools, testEnvironments, technologies, date, ...scalars } =
			values;
		return {
			audit: {
				...current.audit,
				...scalars,
				...(date !== undefined && { date: date || null }),
				...(usedTools !== undefined && {
					usedTools: usedTools.map((name) => ({ name })),
				}),
				...(testEnvironments !== undefined && {
					testEnvironments: testEnvironments.map((name) => ({ name })),
				}),
				...(technologies !== undefined && {
					technologies: technologies.map((name) => ({ name })),
				}),
				// A fully conformant audit has no non-conformities to declare.
				...(values.rate === 100 && { nonCompliantElements: null }),
				// "Non réalisé" invalidates every audit detail; switching back starts blank.
				...(values.isRealised === false && NO_AUDIT),
				toVerify: false,
			},
		};
	},
	// A custom save owns its content: it detaches any Library parent.
	contact: (current, values) => ({
		contact: { ...current.contact, ...values, parent: null, toVerify: false },
	}),
	schema: (current, values) => ({
		schema: {
			...current.schema,
			...values,
			parent: null,
			skipped: false,
			toVerify: false,
		},
	}),
};

/** Every Declaration content write ends here: the status is derived from the
 *  row as it will be written, so content and status land in one update. */
export async function writeDeclaration(
	payload: Payload,
	declaration: PopulatedDeclaration,
	data: DeclarationRowData,
): Promise<PopulatedDeclaration> {
	const next: PopulatedDeclaration = { ...declaration, ...data };
	const status = statusAfterEdit(next);

	const updated = await payload.update({
		collection: "declarations",
		id: declaration.id,
		data: status === declaration.status ? data : { ...data, status },
	});

	return getPopulatedDeclaration(updated);
}

/** Saves one Section: merge the patch under that Section's rules, then write. */
export function saveSection<K extends SectionKind>(
	payload: Payload,
	declaration: PopulatedDeclaration,
	kind: K,
	patch: SectionPatch<K>,
): Promise<PopulatedDeclaration> {
	const merge = MERGERS[kind] as SectionMerger<K>;
	return writeDeclaration(payload, declaration, merge(declaration, patch));
}

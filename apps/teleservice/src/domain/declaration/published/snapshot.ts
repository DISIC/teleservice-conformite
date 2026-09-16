import z from "zod";
import {
	appKindOptions,
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { NO_AUDIT } from "~/domain/declaration/published/noAudit";

type OptionLabel<T extends readonly { label: string }[]> = T[number]["label"];

export type AppKindLabel = OptionLabel<typeof appKindOptions> | "";
export type RgaaVersionLabel = OptionLabel<typeof rgaaVersionOptions>;

const appKindLabels = appKindOptions.map((option) => option.label);
const rgaaVersionLabels = rgaaVersionOptions.map((option) => option.label);

/** The public snapshot's contract. Parsed, never cast: a snapshot that fails
 *  it is treated as absent rather than rendered half-filled. */
export const publishedDeclarationSchema = z.object({
	name: z.string(),
	entityName: z.string(),
	schema: z.object({
		schemaName: z.string(),
		schemaUrl: z.string(),
		actionPlanUrls: z.array(z.object({ name: z.string(), url: z.string() })),
	}),
	appKindLabel: z.enum([...appKindLabels, ""]),
	url: z.string(),
	// ISO calendar dates (YYYY-MM-DD): what the public reads, timezone-free.
	firstPublishedAt: z.iso.date(),
	publishedAt: z.iso.date(),
	audit: z.object({
		isRealised: z.boolean(),
		rgaa_version: z.enum(rgaaVersionLabels),
		realised_by: z.string(),
		rate: z.number(),
		nonCompliantElements: z.string().nullable(),
		disproportionnedCharge: z.string().nullable(),
		optionalElements: z.string().nullable(),
		compliantElements: z.string(),
		technologies: z.array(z.object({ name: z.string() })),
		testEnvironments: z.array(z.string()),
		usedTools: z.array(z.string()),
	}),
	contact: z.object({
		url: z.string().nullable(),
		email: z.string().nullable(),
	}),
});

export type PublishedDeclaration = z.infer<typeof publishedDeclarationSchema>;

export const parsePublishedDeclaration = (
	json: string | null | undefined,
): PublishedDeclaration | null => {
	if (!json) return null;
	try {
		const result = publishedDeclarationSchema.safeParse(JSON.parse(json));
		return result.success ? result.data : null;
	} catch {
		return null;
	}
};

const toIsoDate = (value: string | Date | null | undefined): string | null => {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

type SnapshotDates = {
	publishedAt?: Date;
};

export const extractDeclarationContentToPublish = (
	declaration: PopulatedDeclaration,
	dates: SnapshotDates = {},
): PublishedDeclaration => {
	const publishedAt =
		toIsoDate(dates.publishedAt) ?? toIsoDate(declaration.published_at) ?? "";
	// Without a realised audit there is nothing to publish about it, whatever
	// details the row still carries.
	const audit =
		declaration.audit?.isRealised === true ? declaration.audit : NO_AUDIT;
	return {
		name: declaration.name ?? "",
		entityName: declaration.entity?.name ?? "",
		schema: {
			schemaName: declaration?.schema?.name ?? "",
			schemaUrl: declaration?.schema?.url ?? "",
			actionPlanUrls: (declaration?.schema?.actionPlanUrls ?? []).map(
				(item) => ({ name: item.name ?? "", url: item.url ?? "" }),
			),
		},
		appKindLabel:
			appKindOptions.find((kind) => kind.value === declaration.app_kind)
				?.label ?? "",
		url: declaration?.url ?? "",
		// A first publication in this téléservice is its own initial publication.
		firstPublishedAt: toIsoDate(declaration.first_published_at) ?? publishedAt,
		publishedAt,
		audit: {
			isRealised: audit.isRealised === true,
			rgaa_version:
				rgaaVersionOptions.find((option) => option.value === audit.rgaa_version)
					?.label ?? "RGAA 4",
			realised_by: audit.realisedBy ?? "",
			rate: audit.rate ?? 0,
			nonCompliantElements: audit.nonCompliantElements ?? "",
			disproportionnedCharge: audit.disproportionnedCharge ?? "",
			optionalElements: audit.optionalElements ?? "",
			compliantElements: audit.compliantElements ?? "",
			technologies: audit.technologies ?? [],
			testEnvironments: (audit.testEnvironments ?? []).map(
				(env) =>
					testEnvironmentOptions.find((option) => option.value === env.name)
						?.label ?? env.name,
			),
			usedTools: (audit.usedTools ?? []).map(
				(tool) =>
					toolOptions.find((option) => option.value === tool.name)?.label ??
					tool.name,
			),
		},
		contact: {
			url: declaration.contact?.url ?? "",
			email: declaration.contact?.email ?? "",
		},
	};
};

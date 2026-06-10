import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import z from "zod";
import {
	kindOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import { extractTechnologiesFromUrl } from "~/utils/declaration-helper";
import type { AlbertResponse } from "../albert";

export const importedDeclarationDataSchema = z.object({
	service: z.object({
		name: z.string().nullable(),
		type: z.string().nullable(),
		url: z.string().nullable(),
	}),
	taux: z.string().nullable(),
	rgaaVersion: z.string().nullable(),
	auditRealizedBy: z.string().nullable(),
	publishedAt: z.string().nullable(),
	responsibleEntity: z.string().nullable(),
	compliantElements: z.array(z.string()),
	technologies: z.array(z.string()),
	testEnvironments: z.array(z.string()),
	usedTools: z.array(z.string()),
	nonCompliantElements: z.string().nullable(),
	disproportionnedCharge: z.string().nullable(),
	optionalElements: z.string().nullable(),
	contact: z.object({
		email: z.string().nullable(),
		url: z.string().nullable(),
	}),
	schema: z.object({
		currentYearSchemaUrl: z.string().nullable(),
	}),
});

/**
 * Single normalized shape every import source (ARA API, Albert) converges to
 * before we build collection rows. One target buys one create path and one
 * place to guard against ARA API drift / Albert hallucinations; the future
 * "update from ARA" flow reuses these same normalizers.
 */
export type ImportedDeclarationData = z.infer<
	typeof importedDeclarationDataSchema
>;

export const createOrUpdateEntity = async (
	payload: Payload,
	entityId: number | undefined,
	organisation: string,
	domain: string,
) => {
	if (!entityId) {
		const entity = await payload.create({
			collection: "entities",
			draft: true,
			data: {
				name: organisation,
				kind:
					kindOptions.find((field) => field.label === domain)?.value ?? "none",
			},
		});

		return entity.id;
	}

	await payload.update({
		collection: "entities",
		id: entityId,
		data: {
			name: organisation,
			kind:
				kindOptions.find((field) => field.label === domain)?.value ?? "none",
		},
	});

	return entityId;
};

/** Maps a raw ARA report (GET /api/reports/:id) into the normalized shape. */
export const normalizeAraReport = (araJson: any): ImportedDeclarationData => ({
	service: {
		name: araJson.procedureName ?? null,
		type: null,
		url: araJson.procedureUrl ?? null,
	},
	taux:
		araJson.accessibilityRate != null ? `${araJson.accessibilityRate}%` : null,
	rgaaVersion: "rgaa_4",
	auditRealizedBy: araJson.context?.auditorOrganisation ?? null,
	publishedAt: araJson.publishDate ?? null,
	responsibleEntity: araJson.procedureInitiator ?? null,
	compliantElements: (araJson.pageDistributions ?? []).map(
		(page: any) => page?.name,
	),
	technologies: araJson.context?.technologies ?? [],
	testEnvironments: extractTechnologiesFromUrl(
		(araJson.context?.environments ?? []).map(
			(env: any) => env?.assistiveTechnology,
		),
		testEnvironmentOptions,
	),
	usedTools: extractTechnologiesFromUrl(
		araJson.context?.tools ?? [],
		toolOptions,
	),
	nonCompliantElements: araJson.notCompliantContent ?? null,
	disproportionnedCharge: araJson.derogatedContent ?? null,
	optionalElements: araJson.notInScopeContent ?? null,
	contact: {
		email: araJson.contactEmail ?? null,
		url: araJson.contactFormUrl ?? null,
	},
	schema: { currentYearSchemaUrl: araJson.context?.schemaUrl ?? null },
});

/** Maps an Albert response into the normalized shape (tool labels canonicalized). */
export const normalizeAlbertResponse = (
	albert: AlbertResponse,
): ImportedDeclarationData => ({
	...albert,
	rgaaVersion: albert.rgaaVersion ?? "rgaa_4",
	testEnvironments: extractTechnologiesFromUrl(
		albert.testEnvironments,
		testEnvironmentOptions,
	),
	usedTools: extractTechnologiesFromUrl(albert.usedTools, toolOptions),
});

/** Reads the active user's entity (linked at signup), normalized for reuse. */
export const getUserEntity = async (payload: Payload, userId: number) => {
	const user = await payload.findByID({
		collection: "users",
		id: userId,
		depth: 1,
	});
	const entity = typeof user?.entity === "object" ? user.entity : null;

	return {
		id: entity?.id ?? null,
		name: entity?.name ?? "",
		kind: entity?.kind ?? "none",
	};
};

/** Best-effort hostname of a URL, used as a declaration-name fallback. */
export const hostnameOf = (url: string | null): string | null => {
	if (!url) return null;
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
};

/** Extracts the ARA report id from a report URL, validating it is present. */
export const parseAraReportId = (araUrl: string): string => {
	const id = araUrl.slice(araUrl.lastIndexOf("/") + 1).trim();

	if (!id) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "URL de l'audit Ara invalide",
		});
	}

	return id;
};

/** Fetches a raw ARA report by id, throwing a tRPC error on failure. */
export const fetchAraReport = async (araId: string): Promise<any> => {
	const araResponse = await fetch(
		`https://ara.numerique.gouv.fr/api/reports/${araId}`,
	);

	if (!araResponse.ok) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: `Failed to fetch ARA info: ${araResponse.statusText}`,
		});
	}

	return araResponse.json();
};

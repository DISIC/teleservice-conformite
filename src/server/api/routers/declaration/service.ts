import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import type z from "zod";
import {
	appKindOptions,
	kindOptions,
	rgaaVersionOptions,
} from "~/payload/selectOptions";
import {
	getDefaultDeclarationName,
	getPopulatedDeclaration,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";
import {
	extractDeclarationContentToPublish,
	parsePublishedDeclaration,
} from "~/utils/declaration-content";
import { validateDeclaration } from "~/utils/declaration/validateDeclaration";
import type { declarationGeneral } from "~/forms/declaration/declarationSchema";
import { analyzeUrlWithAlbert } from "../albert";
import {
	fetchAraReport,
	getUserEntity,
	hostnameOf,
	type ImportedDeclarationData,
	normalizeAlbertResponse,
	normalizeAraReport,
	parseAraReportId,
} from "./utils";

/**
 * Creates a declaration from imported ARA or AI data. AI sections are flagged
 * `toVerify`; ARA structured data is trusted. Grants the creator admin access.
 */
const createDeclarationFromImportedData = async (
	payload: Payload,
	userId: number,
	data: ImportedDeclarationData,
	source: "ara" | "ai",
): Promise<number> => {
	const transactionID = await payload.db.beginTransaction();

	if (!transactionID) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to start database transaction",
		});
	}

	try {
		const fallbackName =
			hostnameOf(data.service.url) ??
			(await getDefaultDeclarationName(payload, userId));
		const declarationName = data.service.name?.trim()
			? data.service.name
			: fallbackName;

		const entity = await getUserEntity(payload, userId);
		// Imports never infer the entity's sector: it stays empty until the user
		// picks one on the general Section.
		const entityId =
			entity?.id ??
			(
				await payload.create({
					collection: "entities",
					draft: true,
					data: { name: data.responsibleEntity?.trim() || declarationName },
					req: { transactionID },
				})
			).id;

		const declaration = await payload.create({
			collection: "declarations",
			data: {
				name: declarationName,
				url: data.service.url ?? "",
				app_kind:
					appKindOptions.find((option) => option.value === data.service.type)
						?.value ?? undefined,
				status: "unpublished",
				entity: entityId,
				created_by: userId,
				fromSource: source,
				// AI-generated content needs review; ARA structured data does not.
				audit: {
					isRealised: true,
					realisedBy: data.auditRealizedBy || "-",
					rgaa_version: (data.rgaaVersion ??
						"rgaa_4") as (typeof rgaaVersionOptions)[number]["value"],
					rate: Number(data.taux?.replace("%", "")) || 0,
					testEnvironments: data.testEnvironments.map((name) => ({ name })),
					usedTools: data.usedTools.map((name) => ({ name })),
					technologies: data.technologies.map((name) => ({ name })),
					compliantElements:
						data.compliantElements
							.map((element) => `- ${element}`)
							.join("\n") || "",
					nonCompliantElements: data.nonCompliantElements || "",
					disproportionnedCharge: data.disproportionnedCharge || "",
					optionalElements: data.optionalElements || "",
					toVerify: source === "ai",
				},
				// The source's publication date is when the declaration first went
				// public, not when the audit ran. Unknown stays empty for the declarant.
				first_published_at:
					data.publishedAt && !Number.isNaN(Date.parse(data.publishedAt))
						? new Date(data.publishedAt).toISOString()
						: null,
				contact: {
					name: data.service.name
						? `Contact - ${data.service.name}`
						: "Contact de la déclaration",
					email: data.contact.email || undefined,
					url: data.contact.url || undefined,
					toVerify: source === "ai",
				},
				schema: {
					name: data.service.name
						? `Schéma - ${data.service.name}`
						: "Schéma pluriannuel",
					url: data.schema.currentYearSchemaUrl ?? undefined,
					actionPlanUrls: [],
					skipped: false,
					toVerify: source === "ai",
				},
			},
			req: { transactionID },
			draft: true,
		});

		const declarationId = Number(declaration.id);

		await payload.create({
			collection: "access-rights",
			data: {
				declaration: declarationId,
				user: userId,
				role: "admin",
				status: "approved",
			},
			req: { transactionID },
		});

		await payload.db.commitTransaction(transactionID);

		return declarationId;
	} catch (error) {
		await payload.db.rollbackTransaction(transactionID);
		throw error;
	}
};

/** Fetches and normalizes an ARA report (fetch-only; no declaration created). */
export const getAraReportData = async (
	araId: string,
): Promise<ImportedDeclarationData> =>
	normalizeAraReport(await fetchAraReport(araId));

/**
 * Manual creation collects only the declaration name; the rest of the general
 * info (type, URL, domain) is filled afterwards on the declaration's general
 * Section. The entity is linked as-is (not overwritten) when the user already
 * has one, otherwise a placeholder entity is created.
 */
export const createManualDeclaration = async (
	payload: Payload,
	userId: number,
	input: { name: string; entityId?: number },
): Promise<number> => {
	const { name, entityId } = input;

	const declarationEntityId =
		entityId ??
		(
			await payload.create({
				collection: "entities",
				draft: true,
				data: { name },
			})
		).id;

	const declaration = await payload.create({
		collection: "declarations",
		draft: true,
		data: {
			name,
			entity: declarationEntityId,
			created_by: userId,
			status: "unpublished",
			fromSource: "manual",
		},
	});

	await payload.create({
		collection: "access-rights",
		data: {
			declaration: declaration.id,
			user: userId,
			role: "admin",
			status: "approved",
		},
	});

	return Number(declaration.id);
};

/** Import path — ARA: fetch the structured report, then create. */
export const createDeclarationFromAra = async (
	payload: Payload,
	userId: number,
	araUrl: string,
): Promise<number> => {
	const data = await getAraReportData(parseAraReportId(araUrl));

	return createDeclarationFromImportedData(payload, userId, data, "ara");
};

/** Import path — IA: parse the hosted page with Albert, then create (À vérifier). */
export const createDeclarationFromUrlAnalysis = async (
	payload: Payload,
	userId: number,
	url: string,
): Promise<number> => {
	const data = normalizeAlbertResponse(await analyzeUrlWithAlbert(url));

	return createDeclarationFromImportedData(payload, userId, data, "ai");
};

export const deleteDeclaration = async (
	payload: Payload,
	declaration: PopulatedDeclaration,
): Promise<number> => {
	await payload.update({
		collection: "declarations",
		id: declaration.id,
		data: { deletedAt: new Date().toISOString() },
		trash: true,
	});

	return declaration.id;
};

type DeclarationGeneralUpdateInput = z.infer<
	typeof declarationGeneral
>["general"] & {
	entityId: number;
};

export const updateDeclaration = async (
	payload: Payload,
	declaration: PopulatedDeclaration,
	general: DeclarationGeneralUpdateInput,
) => {
	const {
		organisation,
		kind,
		mobilePlatform,
		url,
		domain,
		name,
		firstPublishedAt,
		entityId,
	} = general;
	const declarationId = declaration.id;

	// Sequential autosave persists partials: skip empty required fields so a
	// cleared value keeps its previously saved content instead of blanking it.
	const domainKind = kindOptions.find((field) => field.value === domain)?.value;
	const entityData = {
		...(organisation ? { name: organisation } : {}),
		...(domainKind ? { kind: domainKind } : {}),
	};
	if (Object.keys(entityData).length > 0)
		await payload.update({
			collection: "entities",
			id: entityId,
			data: entityData,
		});

	const newStatus = await recalculateDeclarationStatus(payload, declarationId, {
		declarationFields: { name, app_kind: kind, url },
	});

	const result = await payload.update({
		collection: "declarations",
		id: declarationId,
		data: {
			...(name ? { name } : {}),
			...(kind
				? {
						app_kind: kind,
						mobile_platform: kind === "mobile_app" ? mobilePlatform : null,
					}
				: {}),
			url,
			first_published_at: firstPublishedAt || null,
			...(newStatus ? { status: newStatus } : {}),
		},
	});

	return getPopulatedDeclaration(result);
};

export const updateDeclarationName = async (
	payload: Payload,
	declaration: PopulatedDeclaration,
	name: string,
) =>
	payload.update({
		collection: "declarations",
		id: declaration.id,
		data: { name },
	});

// Publish always validates: the snapshot is server-built — clients never supply publishedContent.
export const publishDeclaration = async (
	payload: Payload,
	declaration: PopulatedDeclaration,
) => {
	const errors = validateDeclaration(declaration);
	if (errors.length > 0) {
		throw new TRPCError({
			code: "PRECONDITION_FAILED",
			message: "Declaration is incomplete and cannot be published",
		});
	}

	const publishedAt = new Date();
	const result = await payload.update({
		collection: "declarations",
		id: declaration.id,
		data: {
			status: "published",
			publishedContent: JSON.stringify(
				extractDeclarationContentToPublish(declaration, { publishedAt }),
			),
			published_at: publishedAt.toISOString(),
			// A first publication in this téléservice is its own initial publication.
			first_published_at:
				declaration.first_published_at ?? publishedAt.toISOString(),
		},
	});

	return getPopulatedDeclaration(result);
};

export const getPreviousPublishedRate = async (
	payload: Payload,
	declaration: PopulatedDeclaration,
): Promise<number | null> => {
	const versions = await payload.findVersions({
		collection: "declarations",
		where: {
			parent: { equals: declaration.id },
			"version.status": { equals: "published" },
		},
		limit: 2,
		sort: "-updatedAt",
	});

	const previousVersion = versions.docs[1];

	const published = parsePublishedDeclaration(
		previousVersion?.version?.publishedContent,
	);
	return published?.audit.rate ?? null;
};

export const revertToPublished = async (
	payload: Payload,
	declaration: PopulatedDeclaration,
): Promise<number> => {
	if (!declaration.publishedContent) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "No published content to revert to",
		});
	}

	// Groups are captured by the declaration's own version history, so restoring
	// the last published version restores the whole declaration in one step.
	const latestPublished = await payload.findVersions({
		collection: "declarations",
		where: {
			parent: { equals: declaration.id },
			"version.status": { equals: "published" },
		},
		limit: 1,
		sort: "-updatedAt",
	});

	const previousVersionId = latestPublished.docs[0]?.id;

	if (!previousVersionId) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to find previous version of the declaration",
		});
	}

	await payload.restoreVersion({
		collection: "declarations",
		id: previousVersionId,
	});

	return declaration.id;
};

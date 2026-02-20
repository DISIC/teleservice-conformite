import { TRPCError } from "@trpc/server";
import z from "zod";
import type { Payload } from "payload";

import { declarationGeneral } from "~/utils/form/declaration/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";
import {
	type rgaaVersionOptions,
	kindOptions,
	appKindOptions,
	declarationStatusOptions,
	sourceOptions,
} from "~/payload/selectOptions";
import {
	isDeclarationOwner,
	getDefaultDeclarationName,
	getPopulatedDeclaration,
} from "~/server/api/utils/payload-helper";

const statusValues = declarationStatusOptions.map((option) => option.value);

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
	entity: z.object({
		id: z.number().nullable(),
		name: z.string().nullable(),
		kind: z.string().nullable(),
	}),
	status: z
		.enum(sourceOptions.map((option) => option.value))
		.optional()
		.default("default"),
});

const createOrUpdateEntity = async (
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

export const declarationRouter = createTRPCRouter({
	getInfoFromAra: userProtectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { id } = input;

			const araResponse = await fetch(
				`https://ara.numerique.gouv.fr/api/reports/${id}`,
			);

			if (!araResponse.ok) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Failed to fetch ARA info: ${araResponse.statusText}`,
				});
			}

			const araJson = await araResponse.json();

			const declarationInfos = {
				service: {
					name: araJson.procedureName,
					type: null,
					url: araJson.procedureUrl,
				},
				taux: `${araJson.accessibilityRate}%`,
				publishedAt: araJson.publishDate,
				rgaaVersion: null,
				auditRealizedBy: araJson.context.auditorOrganisation,
				responsibleEntity: araJson.procedureInitiator,
				compliantElements: araJson.pageDistributions.map(
					(page: any) => `${page?.name} (${page?.url})`,
				),
				testEnvironments: araJson.context.environments.map(
					(env: any) => env?.assistiveTechnology,
				),
				usedTools: araJson.context.tools,
				nonCompliantElements: araJson.notCompliantContent,
				disproportionnedCharge: araJson.derogatedContent,
				optionalElements: araJson.notInScopeContent,
				contact: {
					email: araJson.contactEmail,
					url: araJson.contactFormUrl,
				},
				schema: {
					currentYearSchemaUrl: araJson.context.schemaUrl ?? "",
				},
				technologies: araJson.context.technologies,
			};

			return { data: declarationInfos };
		}),
	create: userProtectedProcedure
		.input(
			declarationGeneral.extend({
				general: declarationGeneral.shape.general.omit({ name: true }).extend({
					name: z.string().optional(),
					entityId: z.number().optional(),
					status: z.enum(statusValues).optional(),
				}),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { organisation, kind, url, domain, name, entityId, status } =
				input.general;

			const declarationName =
				name ??
				(await getDefaultDeclarationName(
					ctx.payload,
					Number(ctx.session?.user?.id) ?? null,
				));
			const newEntityId = await createOrUpdateEntity(
				ctx.payload,
				entityId ?? undefined,
				organisation,
				domain,
			);

			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be logged in to create a declaration",
				});
			}

			const declaration = await ctx.payload.create({
				collection: "declarations",
				data: {
					name: declarationName,
					app_kind: kind,
					url,
					entity: newEntityId,
					created_by: Number(ctx.session.user.id),
					status: status ?? "unpublished",
				},
			});

			return { data: declaration.id };
		}),
	delete: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { id } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			await ctx.payload.update({
				collection: "declarations",
				id,
				data: { deletedAt: new Date().toISOString() },
				trash: true,
			});

			return { data: id };
		}),
	update: userProtectedProcedure
		.input(
			z.object({
				general: declarationGeneral.shape.general.extend({
					declarationId: z.number(),
					entityId: z.number(),
				}),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { organisation, kind, url, domain, name, declarationId, entityId } =
				input.general;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			await ctx.payload.update({
				collection: "entities",
				id: entityId,
				data: {
					name: organisation,
					kind:
						kindOptions.find((field) => field.label === domain)?.value ??
						"none",
				},
			});

			const result = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					name,
					app_kind: kind,
					url,
					status: "unpublished",
				},
			});

			const updatedDeclaration = await getPopulatedDeclaration(result);

			return { data: updatedDeclaration };
		}),
	updateName: userProtectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, name } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const updatedDeclaration = await ctx.payload.update({
				collection: "declarations",
				id,
				data: {
					name,
				},
			});

			return { data: updatedDeclaration };
		}),
	updateStatus: userProtectedProcedure
		.input(
			z.object({
				id: z.number(),
				status: z.enum(statusValues),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, status } = input;

			await isDeclarationOwner({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			const updatedDeclaration = await ctx.payload.update({
				collection: "declarations",
				id,
				data: {
					status,
				},
			});

			return { data: updatedDeclaration };
		}),
	createFromUrl: userProtectedProcedure
		.input(importedDeclarationDataSchema)
		.mutation(async ({ input, ctx }) => {
			const {
				service,
				taux,
				rgaaVersion,
				auditRealizedBy,
				publishedAt,
				responsibleEntity,
				compliantElements,
				technologies,
				testEnvironments,
				usedTools,
				nonCompliantElements,
				disproportionnedCharge,
				optionalElements,
				contact,
				schema,
				entity,
				status = "default" as (typeof sourceOptions)[number]["value"],
			} = input;

			const transactionID = await ctx.payload.db.beginTransaction();

			if (!transactionID) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to start database transaction",
				});
			}

			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User must be logged in to create a declaration",
				});
			}

			try {
				const declarationName = await getDefaultDeclarationName(
					ctx.payload,
					Number(ctx.session.user.id),
				);

				const newEntityId = await createOrUpdateEntity(
					ctx.payload,
					entity?.id ?? undefined,
					entity?.name ?? "",
					entity?.kind ?? "none",
				);

				const declaration = await ctx.payload.create({
					collection: "declarations",
					data: {
						name: service?.name
							? `Déclaration de ${service.name}`
							: declarationName,
						url: service.url ?? "",
						app_kind:
							appKindOptions.find((option) => option.value === service.type)
								?.value ?? "other",
						status: "unpublished",
						entity: newEntityId,
						created_by: Number(ctx.session.user.id),
					},
					req: { transactionID },
					draft: true,
				});

				const declarationId = Number(declaration?.id);

				const relatedAudit = await ctx.payload.create({
					collection: "audits",
					data: {
						declaration: declarationId,
						realisedBy: auditRealizedBy || "-",
						rgaa_version: (rgaaVersion ??
							"rgaa_4") as (typeof rgaaVersionOptions)[number]["value"],
						rate: Number(taux?.replace("%", "")) || 0,
						testEnvironments: testEnvironments.map((tech) => ({ name: tech })),
						usedTools: usedTools.map((tool) => ({ name: tool })),
						technologies: technologies.map((tech) => ({ name: tech })),
						compliantElements:
							compliantElements.map((element) => `- ${element}`).join("\n") ||
							"",
						nonCompliantElements: nonCompliantElements || "",
						disproportionnedCharge: disproportionnedCharge || "",
						optionalElements: optionalElements || "",
						date:
							publishedAt && !Number.isNaN(Date.parse(publishedAt))
								? new Date(publishedAt).toISOString().slice(0, 10)
								: new Date().toISOString().slice(0, 10),
						status,
					},
					req: { transactionID },
				});

				const relatedContact = await ctx.payload.create({
					collection: "contacts",
					data: {
						declaration: declarationId,
						email: contact.email || "",
						url: contact.url || "",
						status,
					},
					req: { transactionID },
				});

				const relatedSchema = await ctx.payload.create({
					collection: "action-plans",
					data: {
						declaration: declarationId,
						currentYearSchemaUrl: schema?.currentYearSchemaUrl ?? "",
						previousYearsSchemaUrl: "",
						status,
					},
					req: { transactionID },
				});

				await ctx.payload.update({
					collection: "declarations",
					id: declarationId,
					data: {
						audit: relatedAudit.id,
						contact: relatedContact.id,
						actionPlan: relatedSchema.id,
					},
					req: { transactionID },
				});

				await ctx.payload.db.commitTransaction(transactionID);

				return { data: declarationId };
			} catch (error) {
				await ctx.payload.db.rollbackTransaction(transactionID);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create declaration from URL",
				});
			}
		}),
	updatePublishedContent: userProtectedProcedure
		.input(
			z.object({
				id: z.number(),
				content: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, content } = input;

			const isOwner = await isDeclarationOwner({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session?.user?.id) ?? null,
			});

			if (!isOwner) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Must be owner of the declaration to update its published content",
				});
			}

			const updatedDeclaration = await ctx.payload.update({
				collection: "declarations",
				id,
				data: {
					status: "published",
					publishedContent: content,
					published_at: new Date().toISOString(),
				},
			});

			return { data: updatedDeclaration };
		}),
});

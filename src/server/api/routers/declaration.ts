import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import z from "zod";
import {
	appKindOptions,
	kindOptions,
	rgaaVersionOptions,
	sourceOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import {
	getDefaultDeclarationName,
	getPopulatedDeclaration,
	hasAccessToDeclaration,
} from "~/server/api/utils/payload-helper";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import { declarationGeneral } from "~/forms/declaration/declarationSchema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";

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
		.default("manual"),
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
				rgaaVersion: "rgaa_4",
				auditRealizedBy: araJson.context.auditorOrganisation,
				responsibleEntity: araJson.procedureInitiator,
				compliantElements: araJson.pageDistributions.map(
					(page: any) => page?.name,
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
	// Manual creation now collects only the declaration name; the rest of the
	// general info (type, URL, domain) is filled afterwards on the declaration's
	// general Section. The entity is linked as-is (not overwritten) when the user
	// already has one, otherwise a placeholder entity is created.
	createManual: userProtectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				entityId: z.number().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { name, entityId } = input;

			const declarationEntityId =
				entityId ??
				(
					await ctx.payload.create({
						collection: "entities",
						draft: true,
						data: { name, kind: "none" },
					})
				).id;

			const declaration = await ctx.payload.create({
				collection: "declarations",
				draft: true,
				data: {
					name,
					app_kind: "website",
					entity: declarationEntityId,
					created_by: Number(ctx.session.user.id),
					status: "unpublished",
					fromSource: "manual",
				},
			});

			await ctx.payload.create({
				collection: "access-rights",
				data: {
					declaration: declaration.id,
					user: Number(ctx.session.user.id),
					role: "admin",
					status: "approved",
				},
			});

			return { data: declaration.id };
		}),
	delete: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { id } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session.user.id),
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
			const {
				organisation,
				kind,
				mobilePlatform,
				url,
				domain,
				name,
				declarationId,
				entityId,
			} = input.general;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId,
				userId: Number(ctx.session.user.id),
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

			const newStatus = await recalculateDeclarationStatus(
				ctx.payload,
				declarationId,
				{ declarationFields: { name, app_kind: kind, url } },
			);

			const result = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					name,
					app_kind: kind,
					mobile_platform: kind === "mobile_app" ? mobilePlatform : null,
					url,
					...(newStatus ? { status: newStatus } : {}),
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

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session.user.id),
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

	createFromUrl: userProtectedProcedure
		.input(importedDeclarationDataSchema)
		.mutation(async ({ input, ctx }) => {
			const {
				service,
				taux,
				rgaaVersion,
				auditRealizedBy,
				publishedAt,
				// responsibleEntity,
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
				status = "manual",
			} = input;

			const transactionID = await ctx.payload.db.beginTransaction();

			if (!transactionID) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to start database transaction",
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
						fromSource: status,
					},
					req: { transactionID },
					draft: true,
				});

				const declarationId = Number(declaration?.id);

				await ctx.payload.create({
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
							"N/A",
						nonCompliantElements: nonCompliantElements || "",
						disproportionnedCharge: disproportionnedCharge || "",
						optionalElements: optionalElements || "",
						date:
							publishedAt && !Number.isNaN(Date.parse(publishedAt))
								? new Date(publishedAt).toISOString().slice(0, 10)
								: new Date().toISOString().slice(0, 10),
						toVerify: status !== "manual",
					},
					req: { transactionID },
				});

				const createdContact = await ctx.payload.create({
					collection: "contacts",
					data: {
						name: service?.name
							? `Contact - ${service.name}`
							: "Contact de la déclaration",
						email: contact.email || undefined,
						url: contact.url || undefined,
						toVerify: status !== "manual",
					},
					req: { transactionID },
				});

				const createdSchema = await ctx.payload.create({
					collection: "schemas",
					data: {
						schemaName: service?.name
							? `Schéma - ${service.name}`
							: "Schéma pluriannuel",
						schemaUrl: schema?.currentYearSchemaUrl ?? undefined,
						actionPlanUrls: [],
						toVerify: status !== "manual",
					},
					req: { transactionID },
				});

				await ctx.payload.update({
					collection: "declarations",
					id: declarationId,
					data: {
						contact: createdContact.id,
						schema: createdSchema.id,
					},
					req: { transactionID },
				});

				await ctx.payload.create({
					collection: "access-rights",
					data: {
						declaration: declarationId,
						user: Number(ctx.session.user.id),
						role: "admin",
						status: "approved",
					},
					req: { transactionID },
				});

				await ctx.payload.db.commitTransaction(transactionID);

				return { data: declarationId };
			} catch {
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

			const isOwner = await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session.user.id),
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
	getPreviousPublishedRate: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const { id } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session.user.id),
			});

			const versions = await ctx.payload.findVersions({
				collection: "declarations",
				where: {
					parent: { equals: id },
					"version.status": { equals: "published" },
				},
				limit: 2,
				sort: "-updatedAt",
			});

			const previousVersion = versions.docs[1];

			if (!previousVersion?.version?.publishedContent) return null;

			try {
				const published = JSON.parse(
					previousVersion.version.publishedContent as string,
				) as PublishedDeclaration;
				return published.audit.rate ?? null;
			} catch {
				return null;
			}
		}),

	revertToPublished: userProtectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const { id } = input;

			await hasAccessToDeclaration({
				payload: ctx.payload,
				declarationId: id,
				userId: Number(ctx.session.user.id),
			});

			const declaration = await ctx.payload.findByID({
				collection: "declarations",
				id,
			});

			if (!declaration?.publishedContent) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No published content to revert to",
				});
			}

			const published: PublishedDeclaration = JSON.parse(
				declaration.publishedContent,
			);

			const transactionID = await ctx.payload.db.beginTransaction();

			if (!transactionID) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to start database transaction",
				});
			}

			try {
				const latestDeclarations = await ctx.payload.findVersions({
					collection: "declarations",
					where: {
						parent: { equals: declaration.id },
						"version.status": { equals: "published" },
					},
					limit: 1,
					sort: "-updatedAt",
					req: { transactionID },
				});

				const previousVersionId = latestDeclarations.docs[0]?.id;

				if (!previousVersionId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to find previous version of the declaration",
					});
				}

				await ctx.payload.restoreVersion({
					collection: "declarations",
					id: previousVersionId,
					req: { transactionID },
				});

				const audits = await ctx.payload.find({
					collection: "audits",
					where: { declaration: { equals: id } },
					limit: 1,
					req: { transactionID },
				});

				if (audits.docs[0]) {
					const rgaaVersionValue = rgaaVersionOptions.find(
						(o) => o.label === published.audit.rgaa_version,
					)?.value;

					await ctx.payload.update({
						collection: "audits",
						id: audits.docs[0].id,
						context: { skipStatusRecalculation: true },
						data: {
							...(rgaaVersionValue ? { rgaa_version: rgaaVersionValue } : {}),
							realisedBy: published.audit.realised_by,
							rate: published.audit.rate,
							compliantElements: published.audit.compliantElements,
							nonCompliantElements:
								published.audit.nonCompliantElements ?? undefined,
							disproportionnedCharge:
								published.audit.disproportionnedCharge ?? undefined,
							optionalElements: published.audit.optionalElements ?? undefined,
							technologies: published.audit.technologies,
							testEnvironments: published.audit.testEnvironments.map(
								(label) => ({
									name:
										testEnvironmentOptions.find((o) => o.label === label)
											?.value ?? label,
								}),
							),
							usedTools: published.audit.usedTools.map((label) => ({
								name:
									toolOptions.find((o) => o.label === label)?.value ?? label,
							})),
						},
						req: { transactionID },
					});
				}

				const refreshedDeclaration = await ctx.payload.findByID({
					collection: "declarations",
					id,
					depth: 0,
					req: { transactionID },
				});

				const contactId =
					typeof refreshedDeclaration.contact === "number"
						? refreshedDeclaration.contact
						: refreshedDeclaration.contact?.id;
				const schemaIdFromDeclaration =
					typeof refreshedDeclaration.schema === "number"
						? refreshedDeclaration.schema
						: refreshedDeclaration.schema?.id;

				if (contactId) {
					await ctx.payload.update({
						collection: "contacts",
						id: contactId,
						data: {
							email: published.contact.email ?? undefined,
							url: published.contact.url ?? undefined,
						},
						req: { transactionID },
						context: { skipStatusRecalculation: true },
					});
				}

				if (schemaIdFromDeclaration) {
					await ctx.payload.update({
						collection: "schemas",
						id: schemaIdFromDeclaration,
						data: {
							schemaName: published.schema.schemaName,
							schemaUrl: published.schema.schemaUrl,
							actionPlanUrls: published.schema.actionPlanUrls,
						},
						req: { transactionID },
						context: { skipStatusRecalculation: true },
					});
				}

				await ctx.payload.db.commitTransaction(transactionID);

				return { data: id };
			} catch {
				await ctx.payload.db.rollbackTransaction(transactionID);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to revert declaration to published state",
				});
			}
		}),
});

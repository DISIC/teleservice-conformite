import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";
import z from "zod";
import {
	appKindOptions,
	declarationStatusOptions,
	kindOptions,
	rgaaVersionOptions,
	sourceOptions,
} from "~/payload/selectOptions";
import {
	getDefaultDeclarationName,
	getPopulatedDeclaration,
	hasAccessToDeclaration,
} from "~/server/api/utils/payload-helper";
import { recalculateDeclarationStatus } from "~/server/api/utils/publish-comparison";
import type { PublishedDeclaration } from "~/components/declaration/PublishedDeclarationTemplate";
import { declarationGeneral } from "~/utils/form/declaration/schema";
import { createTRPCRouter, userProtectedProcedure } from "../trpc";

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
				rgaaVersion: null,
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
					Number(ctx.session.user.id),
				));

			const newEntityId = await createOrUpdateEntity(
				ctx.payload,
				entityId ?? undefined,
				organisation,
				domain,
			);

			const declaration = await ctx.payload.create({
				collection: "declarations",
				draft: true,
				data: {
					name: declarationName,
					app_kind: kind,
					url,
					entity: newEntityId,
					created_by: Number(ctx.session.user.id),
					status: status ?? "unpublished",
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
			const { organisation, kind, url, domain, name, declarationId, entityId } =
				input.general;

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

			const result = await ctx.payload.update({
				collection: "declarations",
				id: declarationId,
				data: {
					name,
					app_kind: kind,
					url,
				},
			});

			await recalculateDeclarationStatus(ctx.payload, declarationId);

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

				await ctx.payload.create({
					collection: "contacts",
					data: {
						declaration: declarationId,
						email: contact.email || undefined,
						url: contact.url || undefined,
						toVerify: status !== "manual",
					},
					req: { transactionID },
				});

				await ctx.payload.create({
					collection: "action-plans",
					data: {
						declaration: declarationId,
						currentYearSchemaUrl: schema?.currentYearSchemaUrl ?? undefined,
						previousYearsSchemaUrl: undefined,
						toVerify: status !== "manual",
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
			} catch (_error) {
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

			if (!published._raw) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"Published content does not contain raw values required for revert. Please republish the declaration first.",
				});
			}

			const transactionID = await ctx.payload.db.beginTransaction();

			if (!transactionID) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to start database transaction",
				});
			}

			try {
				await ctx.payload.update({
					collection: "declarations",
					id,
					data: {
						name: published.name,
						url: published.url,
						app_kind: published._raw.app_kind as
							| "website"
							| "mobile_app_ios"
							| "mobile_app_android"
							| "other",
						status: "published",
					},
					req: { transactionID },
					context: { skipStatusRecalculation: true },
				});

				const audits = await ctx.payload.find({
					collection: "audits",
					where: { declaration: { equals: id } },
					limit: 1,
					req: { transactionID },
				});

				if (audits.docs[0]) {
					await ctx.payload.update({
						collection: "audits",
						id: audits.docs[0].id,
						data: {
							rgaa_version: published._raw.audit
								.rgaa_version as (typeof rgaaVersionOptions)[number]["value"],
							realisedBy: published._raw.audit.realisedBy,
							rate: published._raw.audit.rate,
							compliantElements: published._raw.audit.compliantElements,
							nonCompliantElements:
								published._raw.audit.nonCompliantElements ?? undefined,
							disproportionnedCharge:
								published._raw.audit.disproportionnedCharge ?? undefined,
							optionalElements:
								published._raw.audit.optionalElements ?? undefined,
							technologies: published._raw.audit.technologies,
							testEnvironments: published._raw.audit.testEnvironments,
							usedTools: published._raw.audit.usedTools,
						},
						req: { transactionID },
					});
				}

				const contacts = await ctx.payload.find({
					collection: "contacts",
					where: { declaration: { equals: id } },
					limit: 1,
					req: { transactionID },
				});

				if (contacts.docs[0]) {
					await ctx.payload.update({
						collection: "contacts",
						id: contacts.docs[0].id,
						data: {
							email: published._raw.contact.email ?? undefined,
							url: published._raw.contact.url ?? undefined,
						},
						req: { transactionID },
					});
				}

				const actionPlans = await ctx.payload.find({
					collection: "action-plans",
					where: { declaration: { equals: id } },
					limit: 1,
					req: { transactionID },
				});

				if (actionPlans.docs[0]) {
					await ctx.payload.update({
						collection: "action-plans",
						id: actionPlans.docs[0].id,
						data: {
							currentYearSchemaUrl:
								published._raw.actionPlan.currentYearSchemaUrl,
							previousYearsSchemaUrl:
								published._raw.actionPlan.previousYearsSchemaUrl,
						},
						req: { transactionID },
					});
				}

				await ctx.payload.db.commitTransaction(transactionID);

				return { data: id };
			} catch (error) {
				await ctx.payload.db.rollbackTransaction(transactionID);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to revert declaration to published state",
				});
			}
		}),
});

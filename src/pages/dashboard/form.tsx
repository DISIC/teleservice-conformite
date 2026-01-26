import { useState } from "react";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import System from "@codegouvfr/react-dsfr/picto/System";

import { useAppForm } from "~/utils/form/context";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";
import {
	DeclarationGeneralForm,
	InitialDeclarationForm,
} from "~/utils/form/declaration/form";
import { api } from "~/utils/api";
import { auth } from "~/utils/auth";
import type { Entity } from "~/payload/payload-types";
import type { appKindOptions } from "~/payload/collections/Declaration";
import type { AlbertResponse } from "~/server/api/routers/albert";
import type { rgaaVersionOptions } from "~/payload/collections/Audit";
import {
	extractToolsFromUrl,
	extractTestEnvironmentsFromUrl,
} from "~/utils/declaration-helper";
import { showNotification } from "~/utils/notification-event";

export default function FormPage({ entity }: { entity: Entity | null }) {
	const { classes } = useStyles();
	const router = useRouter();

	const { mutateAsync: createDeclaration } = api.declaration.create.useMutation(
		{
			onSuccess: async (result) => {
				return result.data;
			},
			onError: (error) => {
				console.error("Error adding declaration:", error);
			},
		},
	);

	const { mutateAsync: createContact } = api.contact.create.useMutation({
		onSuccess: async (result) => {
			return result.data;
		},
		onError: (error) => {
			console.error("Error adding declaration:", error);
		},
	});

	const { mutateAsync: createAudit } = api.audit.create.useMutation({
		onSuccess: async (result) => {
			return result.data;
		},
		onError: (error) => {
			console.error("Error adding declaration:", error);
		},
	});

	const { mutateAsync: createSchema } = api.schema.create.useMutation({
		onSuccess: async (result) => {
			return result.data;
		},
		onError: (error) => {
			console.error("Error adding declaration:", error);
		},
	});

	const { mutateAsync: analyzeUrl, isPending: isAnalyzingUrl } =
		api.albert.analyzeUrl.useMutation({
			onSuccess: async (result) => {
				const declarationInfos = result.data;

				if (!declarationInfos) {
					showNotification({
						title: "Erreur lors de l'analyse de l'URL",
						description: "Echec de la récupération des informations.",
						severity: "alert",
					});

					return;
				}

				const id = await createDeclarationFromUrl(declarationInfos);

				router.push(`/dashboard/declaration/${id}`);
			},
			onError: (error) => {
				showNotification({
					title: "Erreur lors de l'analyse de l'URL",
					description: error.message,
					severity: "alert",
				});

				console.error("Error analyzing URL:", error);
			},
		});

	const { mutateAsync: getInfoFromAra, isPending: isGettingInfoFromAra } =
		api.declaration.getInfoFromAra.useMutation({
			onSuccess: async (result) => {
				console.log("result", result);

				const declarationInfos = {
					service: {
						name: result.data.procedureName,
						type: null,
						url: result.data.procedureUrl,
					},
					taux: `${result.data.accessibilityRate}%`,
					publishedAt: result.data.publishDate,
					rgaaVersion: null,
					auditRealizedBy: result.data.context.auditorOrganisation,
					responsibleEntity: result.data.procedureInitiator,
					compliantElements: result.data.pageDistributions.map(
						(page: any) => `${page?.name} (${page?.url})`,
					),
					testEnvironments: result.data.context.environments.map(
						(env: any) => env?.assistiveTechnology,
					),
					usedTools: result.data.context.tools,
					nonCompliantElements: result.data.notCompliantContent,
					disproportionnedCharge: result.data.derogatedContent,
					optionalElements: result.data.notInScopeContent,
					contact: {
						email: result.data.contactEmail,
						url: result.data.contactFormUrl,
					},
					schema: {
						currentYearSchemaUrl: result.data.context.schemaUrl,
					},
					technologies: result.data.context.technologies,
				};

				const id = await createDeclarationFromUrl(declarationInfos);

				if (!declarationInfos) {
					showNotification({
						title: "Erreur lors de l'analyse de l'URL",
						description: "Echec de la récupération des informations.",
						severity: "alert",
					});

					return;
				}

				router.push(`/dashboard/declaration/${id}`);
			},
			onError: (error) => console.error("error", error),
		});

	const createDeclarationFromUrl = async (declarationInfos: AlbertResponse) => {
		const {
			service,
			taux,
			publishedAt,
			rgaaVersion,
			auditRealizedBy,
			responsibleEntity,
			compliantElements,
			testEnvironments,
			usedTools,
			nonCompliantElements,
			disproportionnedCharge,
			optionalElements,
			contact,
			schema,
			technologies,
		} = declarationInfos;

		const result = await createDeclaration({
			general: {
				name: service?.name ? `Déclaration de ${service.name}` : "",
				url: service.url ?? "",
				kind: "other",
				organisation: entity?.name || "",
				entityId: entity?.id,
				domain: entity?.kind ?? "none",
				status: "unverified",
			},
		});

		await createContact({
			declarationId: Number(result.data),
			email: contact.email || "",
			url: contact.url || "",
			status: "unverified",
		});

		const auditUsedTools = extractToolsFromUrl(usedTools);
		const auditEnvironments = extractTestEnvironmentsFromUrl(testEnvironments);

		await createAudit({
			declarationId: Number(result.data),
			realisedBy: auditRealizedBy || "",
			rgaa_version: (rgaaVersion ??
				"rgaa_4") as (typeof rgaaVersionOptions)[number]["value"],
			rate: Number(taux?.replace("%", "")) || 0,
			testEnvironments: auditEnvironments,
			usedTools: auditUsedTools,
			technologies,
			compliantElements:
				compliantElements.map((element) => `- ${element}`).join("\n") || "",
			nonCompliantElements: nonCompliantElements || "",
			disproportionnedCharge: disproportionnedCharge || "",
			optionalElements: optionalElements || "",
			date:
				publishedAt && !Number.isNaN(Date.parse(publishedAt))
					? new Date(publishedAt).toISOString().slice(0, 10)
					: new Date().toISOString().slice(0, 10),
			status: "unverified",
		});

		await createSchema({
			declarationId: Number(result.data),
			currentYearSchemaUrl: schema.currentYearSchemaUrl ?? "",
			previousYearsSchemaUrl: "",
			status: "unverified",
		});

		return result.data;
	};

	declarationMultiStepFormOptions.defaultValues.section = "initialDeclaration";

	const onClickCancel = () => {
		if (section === "general")
			form.setFieldValue("section", "initialDeclaration");
		else router.back();
	};

	const addDeclaration = async (generalData: {
		name?: string;
		url?: string;
		organisation: string;
		kind: (typeof appKindOptions)[number]["value"];
		domain: string;
	}) => {
		try {
			const general = {
				...generalData,
				url: generalData.url ?? "",
				entityId: entity?.id,
			};

			const result = await createDeclaration({ general });

			router.push(`/dashboard/declaration/${result.data}`);
		} catch (error) {
			console.error("Error adding declaration:", error);
		}
	};

	const getDeclarationInfoFromAra = async (url: string) => {
		try {
			await getInfoFromAra({
				id: url.slice(url.lastIndexOf("/") + 1),
			});
		} catch (error) {
			return;
		}
	};

	declarationMultiStepFormOptions.defaultValues.general = {
		...declarationMultiStepFormOptions.defaultValues.general,
		organisation: entity?.name || "",
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (
				value.section === "initialDeclaration" &&
				value.initialDeclaration.declarationUrl
			) {
				try {
					await analyzeUrl({
						url: value.initialDeclaration.declarationUrl,
					});
				} catch (err) {
					return;
				}
				return;
			}

			if (
				value.section === "initialDeclaration" &&
				value.initialDeclaration.araUrl
			) {
				getDeclarationInfoFromAra(value.initialDeclaration.araUrl);
				return;
			}

			if (
				value.section === "initialDeclaration" &&
				!value.initialDeclaration.declarationUrl &&
				!value.initialDeclaration.araUrl
			) {
				formApi.setFieldValue("section", "general");
				return;
			}

			await addDeclaration(value.general);
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	return !isAnalyzingUrl && !isGettingInfoFromAra ? (
		<div className={classes.main}>
			<h2>
				{section === "initialDeclaration"
					? "Contexte"
					: "Informations générales"}
			</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					{section === "initialDeclaration" && (
						<InitialDeclarationForm form={form} />
					)}
					{section === "general" && (
						<DeclarationGeneralForm form={form} readOnly={false} />
					)}
					<form.AppForm>
						<div className={classes.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								onClick={onClickCancel}
								priority="tertiary"
							/>
							<form.SubscribeButton
								label="Continuer"
								iconId="fr-icon-arrow-right-line"
								iconPosition="right"
							/>
						</div>
					</form.AppForm>
				</div>
			</form>
		</div>
	) : (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "1rem",
				marginBlock: fr.spacing("20v"),
				marginInline: fr.spacing("10v"),
			}}
		>
			<System fontSize="6rem" />
			<h1
				style={{
					color: fr.colors.decisions.text.actionHigh.blueFrance.default,
					fontSize: "1.5rem",
					fontWeight: 700,
					lineHeight: "2rem",
					textAlign: "center",
				}}
			>
				Création de votre déclaration
			</h1>
			<p style={{ fontSize: "1.25rem", textAlign: "center" }}>
				Merci de vérifier les informations récupérées et de les modifier si
				nécessaire
			</p>
		</div>
	);
}

const useStyles = tss.withName(FormPage.name).create({
	main: {
		marginBlock: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const payload = await getPayload({ config });
	const authSession = await auth.api.getSession({
		headers: new Headers(context.req.headers as HeadersInit),
	});

	if (!authSession) {
		return { redirect: { destination: "/" }, props: {} };
	}

	try {
		const user = await payload.findByID({
			collection: "users",
			id: authSession?.user?.id,
			depth: 3,
		});

		return {
			props: {
				entity: user?.entity || null,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/dashboard" },
			props: {},
		};
	}
};

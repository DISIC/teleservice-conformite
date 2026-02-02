import { useState } from "react";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";

import { useAppForm } from "~/utils/form/context";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";
import {
	DeclarationGeneralForm,
	ContextForm,
} from "~/utils/form/declaration/form";
import { api } from "~/utils/api";
import { auth } from "~/utils/auth";
import type { Entity } from "~/payload/payload-types";
import type {
	rgaaVersionOptions,
	appKindOptions,
} from "~/payload/selectOptions";
import {
	extractToolsFromUrl,
	extractTestEnvironmentsFromUrl,
} from "~/utils/declaration-helper";
import { showAlert } from "~/utils/alert-event";
import DeclarationLoader from "~/components/declaration/DeclarationLoader";

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

	const { mutateAsync: analyzeUrl, isPending: isAnalyzingUrl } =
		api.albert.analyzeUrl.useMutation({
			onSuccess: async (result) => {
				const declarationInfos = result.data;

				if (!declarationInfos) {
					showAlert({
						title: "Erreur lors de l'analyse de l'URL",
						description: "Echec de la récupération des informations.",
						severity: "error",
					});

					return;
				}

				const id = await createDeclarationFromUrl({
					...declarationInfos,
					testEnvironments: extractTestEnvironmentsFromUrl(
						declarationInfos?.testEnvironments ?? [],
					),
					usedTools: extractToolsFromUrl(declarationInfos?.usedTools ?? []),
					rgaaVersion: declarationInfos.rgaaVersion
						? (declarationInfos.rgaaVersion as (typeof rgaaVersionOptions)[number]["value"])
						: "rgaa_4",
					entity: {
						id: entity?.id ?? null,
						name: entity?.name ?? "",
						kind: entity?.kind ?? "none",
					},
					status: "fromAI",
				});

				router.push(`/dashboard/declaration/${id.data}`);
			},
			onError: (error) => {
				showAlert({
					title: "Erreur lors de l'analyse de l'URL",
					description: error.message,
					severity: "error",
				});

				console.error("Error analyzing URL:", error);
			},
		});

	const { mutateAsync: getInfoFromAra, isPending: isGettingInfoFromAra } =
		api.declaration.getInfoFromAra.useMutation({
			onSuccess: async (result) => {
				const id = await createDeclarationFromUrl({
					...result.data,
					testEnvironments: extractTestEnvironmentsFromUrl(
						result.data?.testEnvironments ?? [],
					),
					usedTools: extractToolsFromUrl(result.data?.usedTools ?? []),
					entity: {
						id: entity?.id ?? null,
						name: entity?.name ?? "",
						kind: entity?.kind ?? "none",
					},
					status: "fromAra",
				});

				if (!result.data) {
					showAlert({
						title: "Erreur lors de l'analyse de l'URL",
						description: "Echec de la récupération des informations.",
						severity: "error",
					});

					return;
				}

				router.push(`/dashboard/declaration/${id.data}`);
			},
			onError: (error) => console.error("error", error),
		});

	const { mutateAsync: createDeclarationFromUrl } =
		api.declaration.createFromUrl.useMutation({
			onSuccess: async (result) => {
				return result.data;
			},
			onError: (error) => {
				console.error("Error adding declaration from URL:", error);
			},
		});

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
		const araId = url.slice(url.lastIndexOf("/") + 1);

		try {
			await getInfoFromAra({ id: araId });
		} catch (error) {
			return;
		}
	};

	const analyzeDeclarationUrl = async (url: string) => {
		try {
			await analyzeUrl({ url });
		} catch (err) {
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
				await analyzeDeclarationUrl(value.initialDeclaration.declarationUrl);
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
					{section === "initialDeclaration" && <ContextForm form={form} />}
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
		<DeclarationLoader />
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

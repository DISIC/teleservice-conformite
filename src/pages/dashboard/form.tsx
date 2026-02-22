import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import { useStore } from "@tanstack/react-form";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useState } from "react";
import { tss } from "tss-react";
import type { z } from "zod";

import DeclarationLoader from "~/components/declaration/DeclarationLoader";
import { useStyles as useAppStyles } from "~/pages/_app";
import type { Entity } from "~/payload/payload-types";
import {
	appKindOptions,
	testEnvironmentOptions,
	type rgaaVersionOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { importedDeclarationDataSchema } from "~/server/api/routers/declaration";
import { showAlert } from "~/utils/alert-event";
import { api } from "~/utils/api";
import { auth } from "~/utils/auth";
import { extractTechnologiesFromUrl } from "~/utils/declaration-helper";
import { useAppForm } from "~/utils/form/context";
import {
	ContextForm,
	DeclarationGeneralForm,
} from "~/utils/form/declaration/form";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";

export type ImportedDeclarationData = z.infer<
	typeof importedDeclarationDataSchema
>;

export default function FormPage({ entity }: { entity: Entity | null }) {
	const { classes, cx } = useStyles();
	const { classes: appClasses } = useAppStyles();
	const router = useRouter();
	const [importedDeclarationData, setImportedDeclarationData] =
		useState<ImportedDeclarationData | null>(null);

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

	const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
	const [isMinimumDelayComplete, setIsMinimumDelayComplete] = useState(true);

	const { mutateAsync: analyzeUrl, isPending: isAnalyzingUrl } =
		api.albert.analyzeUrl.useMutation({
			onMutate: () => {
				setLoadingStartTime(Date.now());
				setIsMinimumDelayComplete(false);
			},
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

				setImportedDeclarationData({
					...declarationInfos,
					testEnvironments: extractTechnologiesFromUrl(
						declarationInfos?.testEnvironments ?? [],
						testEnvironmentOptions,
					),
					usedTools: extractTechnologiesFromUrl(
						declarationInfos?.usedTools ?? [],
						toolOptions,
					),
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

				return {
					serviceName: declarationInfos.service.name,
					serviceType: declarationInfos.service.type,
					serviceUrl: declarationInfos.service.url,
				};
			},
			onError: (error) => {
				showAlert({
					title: "Erreur lors de l'analyse de l'URL",
					description: error.message,
					severity: "error",
				});

				console.error("Error analyzing URL:", error);
			},
			onSettled: () => {
				const elapsed = Date.now() - (loadingStartTime ?? Date.now());
				const remaining = Math.max(0, 15000 - elapsed);
				setTimeout(() => setIsMinimumDelayComplete(true), remaining);
			},
		});

	const { mutateAsync: getInfoFromAra, isPending: isGettingInfoFromAra } =
		api.declaration.getInfoFromAra.useMutation({
			onMutate: () => {
				setLoadingStartTime(Date.now());
				console.log("here");
				setIsMinimumDelayComplete(false);
			},
			onSuccess: async (result) => {
				if (!result.data) {
					showAlert({
						title: "Erreur lors de l'analyse de l'URL",
						description: "Echec de la récupération des informations.",
						severity: "error",
					});

					return;
				}

				setImportedDeclarationData({
					...result.data,
					testEnvironments: extractTechnologiesFromUrl(
						result.data?.testEnvironments ?? [],
						testEnvironmentOptions,
					),
					usedTools: extractTechnologiesFromUrl(
						result.data?.usedTools ?? [],
						toolOptions,
					),
					entity: {
						id: entity?.id ?? null,
						name: entity?.name ?? "",
						kind: entity?.kind ?? "none",
					},
					status: "fromAra",
				});

				return {
					serviceName: result.data.service.name,
					serviceType: result.data.service.type,
					serviceUrl: result.data.service.url,
				};
			},
			onError: (error) => console.error("error", error),
			onSettled: () => {
				const elapsed = Date.now() - (loadingStartTime ?? Date.now());
				const remaining = Math.max(0, 2000 - elapsed);
				console.log(remaining);
				setTimeout(() => {
					console.log("here2");
					setIsMinimumDelayComplete(true);
				}, remaining);
			},
		});

	const { mutateAsync: createDeclarationFromUrl } =
		api.declaration.createFromUrl.useMutation({
			onSuccess: async (result) => {
				router.push(`/dashboard/declaration/${result.data}`);
			},
			onError: (error) => {
				console.error("Error adding declaration from URL:", error);
			},
		});

	declarationMultiStepFormOptions.defaultValues.section = "initialDeclaration";

	const onClickCancel = () => {
		if (section === "general") {
			scrollTo(0, 0);
			form.setFieldValue("section", "initialDeclaration");
		} else router.back();
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

	const getDeclarationInfoFromAra = async (
		url: string,
	): Promise<{
		serviceName: string;
		serviceType: string;
		serviceUrl: string;
	}> => {
		const araId = url.slice(url.lastIndexOf("/") + 1);

		try {
			const result = await getInfoFromAra({ id: araId });

			return {
				serviceName: result?.data?.service?.name ?? "",
				serviceType: result?.data?.service?.url
					? "website"
					: (result?.data?.service?.type ?? "other"),
				serviceUrl: result?.data?.service?.url ?? "",
			};
		} catch (error) {
			return { serviceName: "", serviceType: "other", serviceUrl: "" };
		}
	};

	const analyzeDeclarationUrl = async (
		url: string,
	): Promise<{
		serviceName: string;
		serviceType: string;
		serviceUrl: string;
	}> => {
		try {
			const result = await analyzeUrl({ url });

			return {
				serviceName: result?.data?.service?.name ?? "",
				serviceType: result?.data?.service?.url
					? "website"
					: (result?.data?.service?.type ?? "other"),
				serviceUrl: result?.data?.service?.url ?? "",
			};
		} catch (err) {
			return { serviceName: "", serviceType: "other", serviceUrl: "" };
		}
	};

	declarationMultiStepFormOptions.defaultValues.general = {
		...declarationMultiStepFormOptions.defaultValues.general,
		organisation: entity?.name || "",
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			scrollTo(0, 0);

			if (
				value.section === "initialDeclaration" &&
				value.initialDeclaration.declarationUrl
			) {
				const { serviceName, serviceType, serviceUrl } =
					await analyzeDeclarationUrl(value.initialDeclaration.declarationUrl);

				formApi.setFieldValue("section", "general");
				formApi.setFieldValue(
					"general.kind",
					appKindOptions.find((option) => option.value === serviceType)
						?.value ?? "other",
				);
				formApi.setFieldValue("general.name", serviceName);
				formApi.setFieldValue("general.url", serviceUrl);

				return;
			}

			if (
				value.section === "initialDeclaration" &&
				value.initialDeclaration.araUrl
			) {
				const { serviceName, serviceType, serviceUrl } =
					await getDeclarationInfoFromAra(value.initialDeclaration.araUrl);

				formApi.setFieldValue("section", "general");
				formApi.setFieldValue(
					"general.kind",
					appKindOptions.find((option) => option.value === serviceType)
						?.value ?? "other",
				);
				formApi.setFieldValue("general.name", serviceName);
				formApi.setFieldValue("general.url", serviceUrl);

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

			if (importedDeclarationData) {
				try {
					await createDeclarationFromUrl({
						...importedDeclarationData,
					});
				} catch (error) {
					console.error("Error adding declaration:", error);
				}

				return;
			}

			await addDeclaration(value.general);
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	const isLoading =
		isAnalyzingUrl || isGettingInfoFromAra || !isMinimumDelayComplete;

	if (isLoading)
		return <DeclarationLoader duration={isAnalyzingUrl ? 15000 : 2000} />;

	return (
		<section className={fr.cx("fr-container")}>
			<div className={appClasses.formContainer}>
				<h1>
					{section === "initialDeclaration"
						? "Ajouter une déclaration"
						: "Informations générales"}
				</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={(e) => {
						form.validate("submit");
					}}
				>
					<div className={classes.formWrapper}>
						<div className={classes.whiteBackground}>
							<p
								className={cx(
									classes.description,
									fr.cx("fr-text--sm", "fr-mb-6v"),
								)}
							>
								Tous les champs sont obligatoires sauf précision contraire
							</p>
							{section === "initialDeclaration" && <ContextForm form={form} />}
							{section === "general" && (
								<DeclarationGeneralForm form={form} readOnly={false} />
							)}
						</div>
						<form.AppForm>
							<div className={classes.actionButtonsContainer}>
								<form.CancelButton
									label="Retour"
									onClick={onClickCancel}
									priority="tertiary"
									ariaLabel="Retour à la liste des déclarations"
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
		</section>
	);
}

const useStyles = tss.withName(FormPage.name).create({
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
		padding: fr.spacing("10v"),
		marginBottom: fr.spacing("6v"),
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
	description: {
		color: fr.colors.decisions.text.mention.grey.default,
		margin: 0,
		marginBottom: fr.spacing("10v"),
		fontWeight: 400,
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

import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import { useStore } from "@tanstack/react-form";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import type { z } from "zod";
import DeclarationLoader from "~/components/declaration/DeclarationLoader";
import DeclarationUrlError from "~/components/declaration/DeclarationUrlError";
import { useCommonStyles } from "~/components/ui/commonStyles";
import { useStyles as useAppStyles } from "~/pages/_app";
import type { Entity } from "~/payload/payload-types";
import {
	appKindOptions,
	type rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { importedDeclarationDataSchema } from "~/server/api/routers/declaration";
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
	const { classes: commonClasses } = useCommonStyles();
	const { push, back } = useRouter();
	const [errorGetInfos, setErrorGetInfos] = useState<{
		from: "url" | "ara";
	}>();
	const importedDeclarationDataRef = useRef<ImportedDeclarationData | null>(
		null,
	);

	const loadingStartTime = useRef<number | null>(null);
	const [isMinimumDelayComplete, setIsMinimumDelayComplete] = useState(true);

	const onErrorRetry = () => {
		form.handleSubmit();
		setErrorGetInfos(undefined);
	};

	const onErrorForward = () => {
		form.reset();
		form.setFieldValue("initialDeclaration.newDeclarationKind", "fromScratch");
		form.setFieldValue("section", "general");
		setErrorGetInfos(undefined);
	};

	const { mutateAsync: createDeclaration } = api.declaration.create.useMutation(
		{
			onError: (error) => {
				console.error("Error adding declaration:", error);
			},
		},
	);

	const { mutateAsync: analyzeUrl, isPending: isAnalyzingUrl } =
		api.albert.analyzeUrl.useMutation({
			onMutate: () => {
				loadingStartTime.current = Date.now();
				setIsMinimumDelayComplete(false);
			},
			onSuccess: (result) => {
				const declarationInfos = result.data;
				importedDeclarationDataRef.current = {
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
					status: "ai",
				};
			},
			onError: (error) => {
				setErrorGetInfos({ from: "url" });
				console.error("Error analyzing URL (Albert):", error);
			},
			onSettled: () => {
				const elapsed = Date.now() - (loadingStartTime.current ?? Date.now());
				const remaining = Math.max(0, 15000 - elapsed);
				setTimeout(() => setIsMinimumDelayComplete(true), remaining);
			},
		});

	const { mutateAsync: getInfoFromAra, isPending: isGettingInfoFromAra } =
		api.declaration.getInfoFromAra.useMutation({
			onMutate: () => {
				loadingStartTime.current = Date.now();
				setIsMinimumDelayComplete(false);
			},
			onSuccess: (result) => {
				importedDeclarationDataRef.current = {
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
					status: "ara",
				};
			},
			onError: (error) => {
				setErrorGetInfos({ from: "ara" });
				console.error("Error getting info from Ara:", error);
			},
			onSettled: () => {
				const elapsed = Date.now() - (loadingStartTime.current ?? Date.now());
				const remaining = Math.max(0, 2000 - elapsed);
				setTimeout(() => setIsMinimumDelayComplete(true), remaining);
			},
		});

	const { mutateAsync: createDeclarationFromUrl } =
		api.declaration.createFromUrl.useMutation({
			onSuccess: (result) => {
				push(`/dashboard/declarations/${result.data}`);
			},
			onError: (error) => {
				console.error("Error adding declaration from URL:", error);
			},
		});

	const addDeclaration = async (generalData: {
		name?: string;
		url?: string;
		organisation: string;
		kind: (typeof appKindOptions)[number]["value"];
		domain: string;
	}) => {
		try {
			const result = await createDeclaration({
				general: {
					...generalData,
					url: generalData.url ?? "",
					entityId: entity?.id,
				},
			});
			push(`/dashboard/declarations/${result.data}`);
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
		} catch {
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
		} catch {
			return { serviceName: "", serviceType: "other", serviceUrl: "" };
		}
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		defaultValues: {
			...declarationMultiStepFormOptions.defaultValues,
			section:
				"initialDeclaration" as typeof declarationMultiStepFormOptions.defaultValues.section,
			general: {
				...declarationMultiStepFormOptions.defaultValues.general,
				organisation: entity?.name || "",
			},
		},
		onSubmit: async ({ value, formApi }) => {
			scrollTo(0, 0);

			if (value.section === "initialDeclaration") {
				const url =
					value.initialDeclaration.declarationUrl ??
					value.initialDeclaration.araUrl;

				if (url) {
					const fetcher = value.initialDeclaration.declarationUrl
						? analyzeDeclarationUrl
						: getDeclarationInfoFromAra;
					const { serviceName, serviceType, serviceUrl } = await fetcher(url);
					formApi.setFieldValue(
						"general.kind",
						appKindOptions.find((option) => option.value === serviceType)
							?.value ?? "other",
					);
					formApi.setFieldValue("general.name", serviceName);
					formApi.setFieldValue("general.url", serviceUrl);
				}

				formApi.setFieldValue("section", "general");
				return;
			}

			if (importedDeclarationDataRef.current) {
				try {
					await createDeclarationFromUrl({
						...importedDeclarationDataRef.current,
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

	const onClickCancel = () => {
		if (section === "general") {
			scrollTo(0, 0);
			form.setFieldValue("section", "initialDeclaration");
		} else back();
	};

	const isLoading =
		isAnalyzingUrl || isGettingInfoFromAra || !isMinimumDelayComplete;

	if (errorGetInfos)
		return (
			<DeclarationUrlError onRetry={onErrorRetry} onForward={onErrorForward} />
		);

	if (isLoading)
		return <DeclarationLoader duration={isAnalyzingUrl ? 15000 : 2000} />;

	return (
		<section className={fr.cx("fr-container")}>
			<div className={appClasses.formContainer}>
				<h1>
					{section === "initialDeclaration"
						? "Créer une déclaration"
						: "Informations générales"}
				</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={classes.formWrapper}>
						<div
							className={cx(commonClasses.whiteBackground, fr.cx("fr-p-8v"))}
						>
							<p className={cx(classes.description, fr.cx("fr-text--sm"))}>
								Tous les champs sont obligatoires sauf précision contraire
							</p>
							{section === "initialDeclaration" && <ContextForm form={form} />}
							{section === "general" && (
								<DeclarationGeneralForm form={form} readOnly={false} />
							)}
						</div>
						<form.AppForm>
							<div className={commonClasses.actionButtonsContainer}>
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
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
	},
	description: {
		color: fr.colors.decisions.text.mention.grey.default,
		margin: 0,
		marginBottom: fr.spacing("10v"),
		fontWeight: 400,
	},
});

export const getServerSideProps: GetServerSideProps = async (context) => {
	const [payload, authSession] = await Promise.all([
		getPayload({ config }),
		auth.api.getSession({
			headers: new Headers(context.req.headers as HeadersInit),
		}),
	]);

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

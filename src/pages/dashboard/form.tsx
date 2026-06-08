import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import type { z } from "zod";
import DeclarationLoader from "~/components/declaration/DeclarationLoader";
import UrlError from "~/components/declaration/UrlError";
import { useCommonStyles } from "~/components/ui/commonStyles";
import { useStyles as useAppStyles } from "~/pages/_app";
import type { Entity } from "~/payload/payload-types";
import {
	type rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { importedDeclarationDataSchema } from "~/server/api/routers/declaration";
import { api } from "~/lib/api";
import { auth } from "~/lib/auth";
import { extractTechnologiesFromUrl } from "~/utils/declaration-helper";
import { useAppForm } from "~/forms/context";
import { ContextForm } from "~/forms/declaration/declarationForm";
import { initialDeclarationFormOptions } from "~/forms/declaration/declarationSchema";

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
		form.setFieldValue("initialDeclaration.newDeclarationKind", "fromScratch");
		setErrorGetInfos(undefined);
	};

	const { mutateAsync: createManualDeclaration } =
		api.declaration.createManual.useMutation({
			onSuccess: (result) => {
				push(`/dashboard/declarations/${result.data}`);
			},
			onError: (error) => {
				console.error("Error creating declaration:", error);
			},
		});

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

	// Fetch the imported declaration data into `importedDeclarationDataRef` via
	// the mutation's onSuccess. Errors are swallowed here so `errorGetInfos`
	// (set in onError) drives the UrlError screen instead of throwing.
	const fetchInfoFromAra = async (url: string) => {
		const araId = url.slice(url.lastIndexOf("/") + 1);
		try {
			await getInfoFromAra({ id: araId });
		} catch {
			/* errorGetInfos handles the failure */
		}
	};

	const fetchInfoFromUrl = async (url: string) => {
		try {
			await analyzeUrl({ url });
		} catch {
			/* errorGetInfos handles the failure */
		}
	};

	const form = useAppForm({
		...initialDeclarationFormOptions,
		onSubmit: async ({ value }) => {
			scrollTo(0, 0);

			const { newDeclarationKind, declarationUrl, araUrl, declarationName } =
				value.initialDeclaration;

			if (newDeclarationKind === "fromScratch") {
				await createManualDeclaration({
					name: declarationName ?? "",
					entityId: entity?.id ?? undefined,
				});
				return;
			}

			const url = declarationUrl ?? araUrl;
			if (!url) return;

			await (declarationUrl ? fetchInfoFromUrl(url) : fetchInfoFromAra(url));

			if (importedDeclarationDataRef.current) {
				try {
					await createDeclarationFromUrl({
						...importedDeclarationDataRef.current,
					});
				} catch (error) {
					console.error("Error creating declaration from URL:", error);
				}
			}
		},
	});

	const onClickCancel = () => back();

	const isLoading =
		isAnalyzingUrl || isGettingInfoFromAra || !isMinimumDelayComplete;

	if (errorGetInfos)
		return <UrlError onRetry={onErrorRetry} onForward={onErrorForward} />;

	if (isLoading)
		return <DeclarationLoader duration={isAnalyzingUrl ? 15000 : 2000} />;

	return (
		<section className={fr.cx("fr-container")}>
			<div className={appClasses.formContainer}>
				<h1>Créer une déclaration</h1>
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
							<ContextForm form={form} />
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

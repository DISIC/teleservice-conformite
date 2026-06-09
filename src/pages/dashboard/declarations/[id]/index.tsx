import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Binders from "@codegouvfr/react-dsfr/picto/Binders";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { tss } from "tss-react";
import { BackButton } from "~/components/ui/BackButton";
import { ErrorSummary } from "~/components/declaration/sections/ErrorSummary";
import { SideMenu } from "~/components/declaration/SideMenu";
import { StateNotice } from "~/components/declaration/StateNotice";
import {
	getDeclarationStatus,
	getEditingMode,
} from "~/utils/declaration/status";
import { StatsCards } from "~/components/declaration/StatsCards";
import { SectionContent } from "~/components/declaration/sections/Content";
import VerifyGeneratedInfoHelpingMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { copyToClipboard } from "~/utils/declaration-helper";
import { parseSectionFromQuery } from "~/utils/declaration/sections";
import { validateDeclaration } from "~/utils/declaration/validateDeclaration";
import { guardDeclaration } from "~/lib/server-guards";

const deleteModal = createModal({
	id: "delete-modal",
	isOpenedByDefault: false,
});

export default function DeclarationPage({
	declaration: initialDeclaration,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const { published, section: sectionQuery, field: fieldQuery } = router.query;
	const currentSection = parseSectionFromQuery(sectionQuery);
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const hasPublishedDeclaration = !!declaration?.publishedContent;
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<{
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}>({ title: "", description: "", severity: "info" });
	const { classes } = useStyles();

	const status = getDeclarationStatus(declaration);
	const editingMode = getEditingMode(status);

	// Declaration-wide publish gate (ADR-0003). Armed by the terminal Section's
	// "Prévisualiser et publier"; once armed, the summary re-derives from the
	// declaration on every save, shrinking as Sections are fixed and clearing
	// at zero.
	const [publishAttempted, setPublishAttempted] = useState(false);
	const declarationErrors = useMemo(
		() => (publishAttempted ? validateDeclaration(declaration) : []),
		[publishAttempted, declaration],
	);

	const { mutateAsync: deleteDeclaration } = api.declaration.delete.useMutation(
		{
			onSuccess: async () => {
				router.push("/dashboard");
			},
			onError: (error) => {
				console.error("Error deleting declaration:", error);
			},
		},
	);

	const showDeclarationAlert = ({
		title,
		description,
		severity,
	}: {
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}) => {
		setAlertDetails({ title, description, severity });
		setShowAlert(true);
	};

	useEffect(() => {
		if (!showAlert) return;

		const timer = setTimeout(() => {
			setShowAlert(false);
		}, 5000);

		return () => clearTimeout(timer);
	}, [showAlert]);

	// When the publish gate routes to an errored Section (via `&field=`), move
	// focus to that field once the Section has mounted, then drop the param so it
	// neither lingers in the URL nor re-fires on later re-renders (ADR-0003).
	useEffect(() => {
		if (typeof fieldQuery !== "string") return;

		const input = document.querySelector<HTMLElement>(`[name="${fieldQuery}"]`);
		if (input) {
			input.focus({ preventScroll: true });
			input.scrollIntoView({ behavior: "smooth", block: "center" });
		}

		const { field: _field, ...query } = router.query;
		router.replace({ query }, undefined, { shallow: true, scroll: false });
	}, [fieldQuery, currentSection, router]);

	useEffect(() => {
		if (published === "true") {
			showDeclarationAlert({
				description: "Votre déclaration est en ligne",
				severity: "success",
			});

			router.replace(`/dashboard/declarations/${declaration.id}`, undefined, {
				shallow: true,
			});
		}
	}, [published]);

	return (
		<>
			<Head>
				<title>
					Déclaration de {declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<section
				id="declaration-page"
				className={fr.cx("fr-container", "fr-mt-10v")}
			>
				<BackButton href="/dashboard" className={fr.cx("fr-mb-6v")}>
					Retour à la liste des déclarations
				</BackButton>
				<header className={classes.headerSection}>
					<span className={classes.header}>
						<h1>{declaration.name}</h1>
						<Badge
							noIcon
							small
							severity={status !== "draft" ? "success" : undefined}
						>
							{status !== "draft" ? "Publié" : "Brouillon"}
						</Badge>
					</span>
					<div className={classes.buttonsContainer}>
						{hasPublishedDeclaration && (
							<>
								<Button
									priority="tertiary"
									size="small"
									linkProps={{
										href: `/declarations/${declaration.id}/publish`,
										target: "_blank",
										rel: "noopener noreferrer",
										title: `Voir la déclaration ${declaration.name}, nouvelle fenêtre`,
									}}
								>
									Voir la déclaration
								</Button>
								<Button
									priority="tertiary"
									iconId="ri-file-copy-line"
									size="small"
									nativeButtonProps={{
										"aria-label":
											"Copier le lien web de la déclaration publiée",
									}}
									onClick={() =>
										copyToClipboard(
											`${process.env.NEXT_PUBLIC_FRONT_URL}/declarations/${declaration.id}/publish`,
											() =>
												showDeclarationAlert({
													description:
														"Lien de la déclaration publiée copié dans le presse-papier",
													severity: "success",
												}),
										)
									}
								>
									Copier le lien
								</Button>
							</>
						)}
						<Button
							iconId="fr-icon-delete-fill"
							priority="tertiary"
							onClick={() => deleteModal.open()}
							size="small"
							nativeButtonProps={{
								"aria-label": "Supprimer la déclaration",
							}}
						>
							Supprimer
						</Button>
					</div>
					{showAlert && (
						<div className={classes.alertWrapper}>
							<Alert
								small
								severity={alertDetails.severity}
								title={alertDetails?.title ?? ""}
								description={alertDetails?.description ?? ""}
								closable
								isClosed={!showAlert}
								onClose={() => setShowAlert(false)}
							/>
						</div>
					)}
				</header>

				<div className={classes.stateNoticeWrapper}>
					<StateNotice
						declaration={declaration}
						onPublishAttempt={() => setPublishAttempted(true)}
						onReverted={() => router.reload()}
					/>
				</div>

				<div className={classes.statsWrapper}>
					<StatsCards declaration={declaration} />
				</div>

				{declaration.fromSource === "ai" && (
					<div className={classes.aiBannerWrapper}>
						<VerifyGeneratedInfoHelpingMessage />
					</div>
				)}

				<div className={classes.tabContent}>
					{declarationErrors.length > 0 && (
						<div className={classes.errorSummaryWrapper}>
							<ErrorSummary
								declarationId={declaration.id}
								errors={declarationErrors}
							/>
						</div>
					)}
					<div
						className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}
						role="presentation"
					>
						<aside className={fr.cx("fr-col-12", "fr-col-md-4")}>
							<SideMenu
								declaration={declaration}
								currentSection={currentSection}
							/>
						</aside>
						<div className={fr.cx("fr-col-12", "fr-col-md-8")}>
							<SectionContent
								declaration={declaration}
								currentSection={currentSection}
								onDeclarationChange={setDeclaration}
								mode={editingMode}
								onPublishAttempt={() => setPublishAttempted(true)}
							/>
						</div>
					</div>
				</div>
			</section>

			<deleteModal.Component
				title="Supprimer la déclaration"
				buttons={[
					{
						doClosesModal: true,
						children: "Annuler",
						nativeButtonProps: {
							"aria-label": "Annuler la suppression de la déclaration",
						},
					},
					{
						doClosesModal: false,
						priority: "primary",
						children: "Supprimer",
						iconId: "fr-icon-delete-fill",
						nativeButtonProps: {
							"aria-label": "Confirmer la suppression de la déclaration",
						},
						className: classes.dialogActionButton,
						onClick: async () => {
							try {
								await deleteDeclaration({ id: declaration?.id });
							} catch (error) {
								console.error("Error deleting declaration:", error);
							}
							deleteModal.close();
						},
					},
				]}
				className={classes.deleteModal}
			>
				<div className={classes.emptyStateContainer}>
					<Binders fontSize="250px" />
					<div>
						<p>
							Cette action est irréversible et entrainera la suppression de la
							page publique de la déclaration.
						</p>
						<p>
							Nous vous rappelons que chaque site doit fournir une déclaration
							d'accessibilité accessible aux usagers.
						</p>
						<p>
							Si votre déclaration arrive en fin de validité, vous pouvez la
							mettre à jour depuis l'onglet « Déclaration » de votre
							déclaration.
						</p>
					</div>
				</div>
			</deleteModal.Component>
		</>
	);
}

const useStyles = tss.withName(DeclarationPage.name).create({
	headerSection: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		rowGap: fr.spacing("2v"),
		marginBottom: fr.spacing("6v"),
	},
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "flex-start",
		flexWrap: "wrap",
		gap: fr.spacing("3v"),
		"& > h1": {
			margin: 0,
		},
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: fr.spacing("4v"),
	},
	statsWrapper: {
		marginBottom: fr.spacing("8v"),
	},
	stateNoticeWrapper: {
		marginBottom: fr.spacing("6v"),
	},
	errorSummaryWrapper: {
		marginBottom: fr.spacing("6v"),
	},
	aiBannerWrapper: {
		marginBottom: fr.spacing("6v"),
	},
	emptyStateContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: fr.spacing("8v"),
		backgroundColor: fr.colors.decisions.background.open.blueFrance.default,
		padding: fr.spacing("6v"),
		"& > div": {
			"& p:last-child": {
				marginBottom: 0,
			},
		},
	},
	dialogActionButton: {
		backgroundColor:
			fr.colors.decisions.background.actionHigh.redMarianne.default,
		color: fr.colors.decisions.text.inverted.info.default,
	},
	tabContent: {
		paddingTop: fr.spacing("6v"),
		paddingBottom: fr.spacing("16v"),
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		marginTop: fr.spacing("6v"),
		"& div": {
			width: "100%",
		},
	},
	deleteModal: {
		"& .fr-modal__footer": {
			marginTop: fr.spacing("8v"),
			borderTop: `2px solid ${fr.colors.decisions.border.default.grey.default}`,
		},
		"& .fr-modal__content": {
			marginBottom: fr.spacing("8v"),
		},
	},
});

export const getServerSideProps = (async (context) =>
	guardDeclaration(context)) satisfies GetServerSideProps<{
	declaration: PopulatedDeclaration;
}>;

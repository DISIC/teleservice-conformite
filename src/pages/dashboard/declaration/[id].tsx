import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import Binders from "@codegouvfr/react-dsfr/picto/Binders";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import Head from "next/head";

import { StatusBadge } from "~/components/declaration/DeclarationStatusBadge";
import Demarches from "~/components/declaration/Demarches";
import Membres from "~/components/declaration/Membres";
import {
	type PopulatedDeclaration,
	getDeclarationById,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { copyToClipboard } from "~/utils/declaration-helper";

const deleteModal = createModal({
	id: "delete-modal",
	isOpenedByDefault: false,
});

interface DeclarationPageProps {
	declaration: PopulatedDeclaration;
}

export default function DeclarationPage({ declaration }: DeclarationPageProps) {
	const router = useRouter();
	const { published } = router.query;
	const hasPublishedDeclaration = !!declaration?.publishedContent;
	const [selectedTabId, setSelectedTabId] = useState<string>("demarches");
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<{
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}>({ title: "", description: "", severity: "info" });
	const [declarationName, setDeclarationName] = useState<string>(
		declaration?.name ?? "",
	);
	const { classes, cx } = useStyles();

	const { mutateAsync: deleteDeclaration } = api.declaration.delete.useMutation(
		{
			onSuccess: async (result) => {
				router.push("/dashboard");
			},
			onError: (error) => {
				console.error("Error deleting declaration:", error);
			},
		},
	);

	const onDelete = async () => {
		deleteModal.open();
	};

	const TabContent = ({ selectedTabId }: { selectedTabId: string }) => {
		if (selectedTabId === "demarches") {
			return <Demarches declaration={declaration} />;
		}

		if (selectedTabId === "members") {
			return <Membres declaration={declaration} />;
		}

		return null;
	};

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

	useEffect(() => {
		if (published === "true") {
			showDeclarationAlert({
				description: "Votre déclaration est en ligne",
				severity: "success",
			});

			router.replace(`/dashboard/declaration/${declaration.id}`, undefined, {
				shallow: true,
			});
		}
	}, [published]);

	return (
		<>
			<Head>
				<title>Déclaration de {declarationName} - Téléservice Conformité</title>
			</Head>
			<section id="declaration-page" className={fr.cx("fr-container")}>
				<Breadcrumb
					homeLinkProps={{
						href: "/dashboard",
					}}
					segments={[]}
					currentPageLabel={declarationName}
					className={fr.cx("fr-mb-3w")}
				/>
				<section id="header" className={classes.headerSection}>
					<div className={classes.header}>
						<h1>
							{declarationName}{" "}
							<StatusBadge
								isPublished={declaration?.status === "published"}
								isModified={
									declaration?.status === "unpublished" &&
									hasPublishedDeclaration
								}
								isDraft={
									declaration?.status !== "published" &&
									!hasPublishedDeclaration
								}
							/>
						</h1>
					</div>
					<div className={classes.buttonsContainer}>
						{hasPublishedDeclaration && (
							<>
								<Button
									priority="tertiary"
									iconId="fr-icon-eye-fill"
									linkProps={{
										href: `/declaration/${declaration.id}/publish`,
										target: "_blank",
										rel: "noopener noreferrer",
									}}
								>
									Voir la declaration
								</Button>
								<Button
									priority="tertiary"
									iconId="fr-icon-eye-fill"
									onClick={() =>
										copyToClipboard(
											`${process.env.NEXT_PUBLIC_FRONT_URL}/dashboard/declaration/${declaration.id}`,
											() =>
												showDeclarationAlert({
													description: "Lien copié dans le presse-papier",
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
							onClick={onDelete}
						>
							Supprimer
						</Button>
					</div>
					{showAlert && (
						<div className={classes.alertWrapper}>
							<Alert
								small={true}
								severity={alertDetails.severity}
								title={alertDetails?.title ?? ""}
								description={alertDetails?.description ?? ""}
								closable
								isClosed={!showAlert}
								onClose={() => setShowAlert(false)}
							/>
						</div>
					)}
				</section>
				<Tabs
					selectedTabId={selectedTabId}
					tabs={[
						{ tabId: "demarches", label: "Démarche" },
						{ tabId: "members", label: "Membres" },
					]}
					onTabChange={setSelectedTabId}
					className={classes.tabs}
				>
					<TabContent selectedTabId={selectedTabId} />
				</Tabs>
			</section>
			<deleteModal.Component
				title="Supprimer la déclaration"
				buttons={[
					{
						doClosesModal: true,
						children: "Annuler",
					},
					{
						doClosesModal: false,
						priority: "primary",
						children: "Supprimer",
						iconId: "fr-icon-delete-fill",
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
							mettre à jour depuis l’onglet “Démarche” de votre déclaration.
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
		flexDirection: "column",
		alignItems: "start",
		justifyContent: "flex-start",
		marginBottom: fr.spacing("16v"),
	},
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		gap: fr.spacing("3v"),
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("4v"),

		"& a[target='_blank']::after": {
			content: "none",
		},
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
	tabs: {
		boxShadow: "none",
		"& > ul": {
			padding: 0,
			margin: 0,
			boxShadow: `0 -1px 0 0 ${fr.colors.decisions.border.default.grey.default} inset`,
			gap: fr.spacing("8v"),
		},
		"& > ul > li > button": {
			border: "none !important",
			backgroundColor: "inherit !important",
			backgroundImage: "none !important",
			paddingLeft: 0,
			paddingRight: 0,
			margin: 0,
			borderBottom: "3px solid transparent !important",

			"&[aria-selected='true']": {
				borderColor: `${fr.colors.decisions.border.actionHigh.blueFrance.default} !important`,
				borderTop: "none !important",
			},
		},
		"& > div": {
			padding: `${fr.spacing("10v")} 0`,
			border: "none !important",
			boxShadow: "none !important",
			marginBlock: fr.spacing("6v"),
		},
		"&::before": {
			display: "none",
		},
	},
	editableNameInput: {
		outline: "none",
		border: "none",
		fontSize: "2.5rem",
		fontWeight: fr.typography[5].style.fontWeight,
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		marginTop: fr.spacing("8v"),

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

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	return {
		props: {
			declaration: declaration,
		},
	};
};

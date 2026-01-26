import { useState, useEffect } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Binders from "@codegouvfr/react-dsfr/picto/Binders";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

import { api } from "~/utils/api";
import Demarches from "~/components/declaration/Demarches";
import Membres from "~/components/declaration/Membres";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
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
	const { classes } = useStyles();

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

	const declarationNotComplete =
		!declaration.audit ||
		!declaration.contact ||
		!declaration.entity ||
		!declaration.actionPlan;

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

	return (
		<>
			<section id="declaration-page" className={classes.declarationPage}>
				<section id="breadcrumbs">
					<Breadcrumb
						homeLinkProps={{
							href: "/dashboard",
						}}
						segments={[]}
						currentPageLabel={declarationName}
					/>
				</section>
				<section id="header" className={classes.headerSection}>
					<div className={classes.header}>
						<h1>
							{declarationName}{" "}
							<Badge
								noIcon={true}
								small={true}
								severity={
									declaration?.status === "published" ? "success" : undefined
								}
							>
								{declaration?.status === "published" ? "Publiée" : "Brouillon"}
							</Badge>
						</h1>
					</div>
					<div className={classes.buttonsContainer}>
						{declaration?.status === "published" && (
							<>
								<Button
									priority="tertiary"
									iconId="fr-icon-eye-fill"
									linkProps={{
										href: `/declaration/${declaration.id}/publish`,
									}}
								>
									Voir la declaration
								</Button>
								<Button priority="tertiary" iconId="fr-icon-eye-fill">
									Copier le lien
								</Button>
							</>
						)}
						<Button
							priority="tertiary"
							iconId="fr-icon-eye-fill"
							disabled={declarationNotComplete}
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
						{ tabId: "demarches", label: "Démarches" },
						{ tabId: "members", label: "Membres" },
					]}
					onTabChange={setSelectedTabId}
					className={classes.tabs}
				>
					{<TabContent selectedTabId={selectedTabId} />}
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
			>
				<div className={classes.emptyStateContainer}>
					<Binders fontSize="250px" />
					<p>
						Cette action est irréversible et entrainera la suppression de la
						page publique de la déclaration.
						<br />
						Nous vous rappelons que chaque site doit fournir une déclaration
						d'accessibilité accessible aux usagers.
						<br />
						Si votre déclaration arrive en fin de validité, vous pouvez la
						mettre à jour depuis l’onglet “Démarche” de votre déclaration.
					</p>
				</div>
			</deleteModal.Component>
		</>
	);
}

const useStyles = tss.withName(DeclarationPage.name).create({
	declarationPage: {
		marginBlock: fr.spacing("10v"),
	},
	headerSection: {
		display: "flex",
		flexDirection: "column",
		alignItems: "start",
		justifyContent: "flex-start",
		marginBottom: fr.spacing("12v"),
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
	},
	emptyStateContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: fr.spacing("6v"),
		backgroundColor: fr.colors.decisions.background.open.blueFrance.default,
		padding: fr.spacing("6v"),
	},
	dialogActionButton: {
		backgroundColor:
			fr.colors.decisions.background.actionHigh.redMarianne.default,
		color: fr.colors.decisions.text.inverted.info.default,
	},
	tabs: {
		"& > ul > li > button": {
			border: "none !important",
			backgroundColor: "inherit !important",
			backgroundImage: "none !important",

			"&[aria-selected='true']": {
				borderBottom: `3px solid ${fr.colors.decisions.border.actionHigh.blueFrance.default} !important`,
				borderTop: "none !important",
			},
		},

		"& > div": {
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

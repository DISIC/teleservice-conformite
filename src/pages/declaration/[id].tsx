import { useState } from "react";
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

import { api } from "~/utils/api";
import type { Declaration } from "payload/payload-types";
import Demarches from "~/components/declaration/Demarches";
import Membres from "~/components/declaration/Membres";

const deleteModal = createModal({
	id: "delete-modal",
	isOpenedByDefault: false,
});

interface DeclarationPageProps {
	declaration: Declaration | null;
}

export default function DeclarationPage({ declaration }: DeclarationPageProps) {
	const router = useRouter();
	const [selectedTabId, setSelectedTabId] = useState<string>("demarches");
	const { classes } = useStyles();

	const { mutateAsync: deleteDeclaration } = api.declaration.delete.useMutation(
		{
			onSuccess: async (result) => {
				router.push("/declarations");
			},
			onError: (error) => {
				console.error("Error adding declaration:", error);
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

	return (
		<>
			<section id="declaration-page">
				<section id="breadcrumbs">
					<Breadcrumb
						segments={[
							{ label: "Accueil", linkProps: { href: "/declarations" } },
						]}
						currentPageLabel={declaration?.name}
					/>
				</section>
				<section id="header" className={classes.headerSection}>
					<div className={classes.header}>
						<h1>{`${declaration?.name} - ${declaration?.app_kind}`}</h1>
						<Badge
							noIcon={true}
							small={true}
							severity={
								declaration?.status === "published" ? "success" : undefined
							}
						>
							{declaration?.status === "published" ? "Publiée" : "Brouillon"}
						</Badge>
					</div>
					<div className={classes.buttonsContainer}>
						<Button priority="tertiary" iconId="fr-icon-eye-fill">
							Voir la declaration
						</Button>
						<Button priority="tertiary" iconId="fr-icon-eye-fill">
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
				</section>
				<Tabs
					selectedTabId={selectedTabId}
					tabs={[
						{ tabId: "demarches", label: "Démarches" },
						{ tabId: "members", label: "Membres" },
					]}
					onTabChange={setSelectedTabId}
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
	headerSection: {
		display: "flex",
		flexDirection: "column",
		alignItems: "start",
		justifyContent: "flex-start",
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
		marginBottom: fr.spacing("12v"),
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
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			// redirect: { destination: "/" },
		};
	}

	const payload = await getPayload({ config });

	try {
		const result = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		if (!result) {
			return {
				props: {
					declaration: null,
				},
			};
		}

		const declaration = {
			...result,
			updatedAtFormatted: new Intl.DateTimeFormat("fr-FR", {
				dateStyle: "short",
				timeStyle: "short",
				timeZone: "Europe/Paris",
			}).format(new Date(result.updatedAt)),
		};

		return {
			props: {
				declaration: declaration,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			// redirect: { destination: "/" },
			props: {},
		};
	}
};

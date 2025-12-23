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
				<section
					id="header"
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "start",
						justifyContent: "flex-start",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "flex-start",
							gap: "10px",
						}}
					>
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
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							gap: "1rem",
							marginBottom: "3rem",
						}}
					>
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
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "1rem",
					}}
				>
					<image />
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
		const declaration = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		return {
			props: {
				declaration: declaration || null,
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

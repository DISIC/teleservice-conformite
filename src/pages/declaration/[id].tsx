import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";

import type { Declaration } from "payload/payload-types";
import Demarches from "~/components/declaration/Demarches";
import Membres from "~/components/declaration/Membres";

interface DeclarationPageProps {
	declaration: Declaration | null;
}

export default function DeclarationPage({ declaration }: DeclarationPageProps) {
	console.log("DeclarationPage declaration:", declaration);
	const [selectedTabId, setSelectedTabId] = useState<string>("demarches");

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
					<Button iconId="fr-icon-delete-fill" priority="tertiary">
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

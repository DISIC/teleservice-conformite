import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import type { Declaration } from "payload/payload-types";

interface DeclarationPageProps {
	declaration: Declaration | null;
}

export default function DeclarationPage({ declaration }: DeclarationPageProps) {
	const [selectedTabId, setSelectedTabId] = useState<string>("demarches");

	const TabContent = ({ selectedTabId }: { selectedTabId: string }) => {
		if (selectedTabId === "demarches") {
			return (
				<section id="demarches-tab">
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							gap: "1rem",
							justifyContent: "center",
						}}
					>
						<Tile
							title="Informations générales"
							linkProps={{
								href: `/declaration/${declaration?.id ?? 1}/infos`,
							}}
							enlargeLinkOrButton={true}
							orientation="horizontal"
							start={
								<Badge noIcon severity="new">
									A verifier
								</Badge>
							}
						/>
						<Tile
							title="Plans d'actions"
							linkProps={{
								href: `/declaration/${declaration?.id ?? 1}/plans-actions`,
							}}
							enlargeLinkOrButton={true}
							orientation="horizontal"
							start={
								<Badge noIcon severity="new">
									A verifier
								</Badge>
							}
						/>
						<Tile
							title="Resultat de l'audit"
							linkProps={{
								href: `/declaration/${declaration?.id ?? 1}/audit`,
							}}
							enlargeLinkOrButton={true}
							orientation="horizontal"
							start={
								<Badge noIcon severity="new">
									A verifier
								</Badge>
							}
						/>
						<Tile
							title="Contact"
							linkProps={{
								href: `/declaration/${declaration?.id ?? 1}/contact`,
							}}
							enlargeLinkOrButton={true}
							orientation="horizontal"
							start={
								<Badge noIcon severity="new">
									A verifier
								</Badge>
							}
						/>
					</div>
				</section>
			);
		}

		return null;
	};

	return (
		<section id="declaration-page">
			<section id="breadcrumbs">
				<Breadcrumb
					segments={[
						{ label: "Accueil", linkProps: { href: "/" } },
						{ label: "%Nom du service", linkProps: { href: "/" } },
					]}
					currentPageLabel={declaration?.name ?? "Nom de la declaration"}
				/>
			</section>

			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "flex-start",
					gap: "10px",
				}}
			>
				<h1>{declaration?.name ?? "Nom de la declaration"}</h1>
				<Badge noIcon={true} small={true} severity="success">
					{declaration?.status ?? "Publié"}
				</Badge>
			</div>
			<Tabs
				selectedTabId={selectedTabId}
				tabs={[
					{ tabId: "demarches", label: "Démarches" },
					{ tabId: "members", label: "Membres" },
					{ tabId: "documentation", label: "Documentation" },
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

	// const payload = await getPayload({ config });

	try {
		// const declaration = await payload.findByID({
		// 	collection: "declarations",
		// 	id: Number.parseInt(id),
		// 	depth: 3,
		// });

		return {
			props: {
				declaration: null,
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

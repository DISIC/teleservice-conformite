import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import type { Declaration } from "payload/payload-types";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { useRouter } from "next/router";

interface DeclarationsPageProps {
	declarations: Declaration[];
}

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { declarations } = props;
	const router = useRouter();

	return (
		<section
			id="declarations-page"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "30px",
				padding: "40px",
			}}
		>
			<h1
				style={{
					fontFamily: "Marianne",
					fontWeight: 700,
					fontSize: "40px",
					lineHeight: "48px",
				}}
			>
				Vos déclarations d'accessibilité
			</h1>
			<div
				style={{
					display: declarations?.length ? "flex" : "none",
					justifyContent: "flex-end",
				}}
			>
				<Button
					iconId="fr-icon-add-line"
					priority="tertiary"
					onClick={() => router.push("/form")}
				>
					Ajouter une declaration
				</Button>
			</div>
			{declarations.length ? (
				<div>
					{declarations.map((declaration) => (
						<div
							key={declaration.id}
							style={{ display: "flex", justifyContent: "space-between" }}
						>
							<div>
								<div
									style={{
										display: "flex",
										alignItems: "flex-start",
										gap: "10px",
									}}
								>
									<h2
										style={{
											margin: 0,
											color: "#8585f6",
											fontWeight: 700,
											fontSize: "18px",
											fontFamily: "Marianne",
											lineHeight: "28px",
										}}
									>
										{declaration.name}
									</h2>
									<Badge
										noIcon={true}
										small={true}
										severity={
											declaration?.status === "published"
												? "success"
												: undefined
										}
									>
										{declaration?.status ?? "Brouillon"}
									</Badge>
								</div>
								<p
									style={{
										margin: 0,
										fontWeight: 400,
										fontSize: "14px",
										fontFamily: "Marianne",
										lineHeight: "24px",
										color: "#666666",
									}}
								>
									Dernière modification le{" "}
									{new Date(declaration.updatedAt).toLocaleString()}
								</p>
								<p
									style={{
										margin: 0,
										fontWeight: 400,
										fontSize: "14px",
										fontFamily: "Marianne",
										lineHeight: "24px",
										color: "#666666",
									}}
								>
									{declaration.entity.name}
								</p>
								<p
									style={{
										margin: 0,
										fontWeight: 400,
										fontSize: "14px",
										fontFamily: "Marianne",
										lineHeight: "24px",
										color: "#666666",
									}}
								>
									Site web - {declaration.siteUrl}
								</p>
							</div>
							{declaration.rate && (
								<div>
									<p
										style={{
											margin: 0,
											fontWeight: 700,
											fontSize: "28px",
											fontFamily: "Marianne",
											lineHeight: "36px",
										}}
									>
										{declaration.rate}%
									</p>
									<p
										style={{
											margin: 0,
											fontWeight: 400,
											fontSize: "16px",
											fontFamily: "Marianne",
											lineHeight: "24px",
										}}
									>
										taux conformité
									</p>
								</div>
							)}
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								<Button
									iconId="fr-icon-edit-box-fill"
									priority="primary"
									onClick={() => router.push(`/declaration/${declaration.id}`)}
									style={{ width: "100%" }}
								>
									Mettre à jour
								</Button>
								<Button
									iconId="fr-icon-share-line"
									priority="tertiary"
									style={{ width: "100%" }}
								>
									Copier le lien
								</Button>
							</div>
						</div>
					))}
				</div>
			) : (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "20px",
						justifyContent: "center",
						alignItems: "center",
						marginTop: "100px",
					}}
				>
					<Conclusion fontSize="120px" />
					<h2
						style={{
							fontFamily: "Marianne",
							fontWeight: 700,
							fontSize: "22px",
							lineHeight: "28px",
						}}
					>
						Créez votre déclaration d’accessibilité
					</h2>
					<p
						style={{
							fontFamily: "Marianne",
							fontWeight: 400,
							fontSize: "20px",
							lineHeight: "32px",
							color: "#666666",
						}}
					>
						Publiez une déclaration conforme pour répondre aux obligations
						légales
					</p>
					<Button onClick={() => router.push("/form")} priority="primary">
						Créer une déclaration
					</Button>
				</div>
			)}
		</section>
	);
}

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const payload = await getPayload({ config });

	try {
		const declarations = await payload.find({
			collection: "declarations",
			depth: 3,
		});

		// const declarations = [
		// 	{
		// 		id: "1",
		// 		name: "Nom de la declaration 1",
		// 		status: "unpublished",
		// 		updatedAt: "2024-01-15",
		// 		rate: 83,
		// 	},
		// ];

		return {
			props: {
				declarations: declarations?.docs || [],
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

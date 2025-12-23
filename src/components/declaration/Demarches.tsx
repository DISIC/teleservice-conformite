import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Button } from "@codegouvfr/react-dsfr/Button";

import type { Declaration } from "payload/payload-types";

interface DemarchesProps {
	declaration: Declaration | null;
}

export default function Demarches({ declaration }: DemarchesProps) {
	return (
		<section
			id="demarches-tab"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "2rem",
			}}
		>
			{declaration?.audit?.rate && (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "1rem",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							gap: "10px",
							backgroundColor: "#3a3a68",
							paddingInline: "30px",
							paddingBlock: "40px",
							borderRadius: "5px",
							justifyContent: "space-between",
						}}
					>
						<p
							style={{
								margin: "0px",
								fontWeight: 400,
								fontFamily: "Marianne",
								fontSize: "16px",
								lineHeight: "24px",
							}}
						>
							Taux de conformite
						</p>
						<p
							style={{
								margin: "0px",
								fontWeight: 400,
								fontFamily: "Marianne",
								fontSize: "16px",
								lineHeight: "24px",
							}}
						>
							<strong>
								{declaration?.audit?.rate
									? `${declaration.audit.rate}%`
									: "N/A"}
							</strong>
						</p>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							gap: "10px",
							backgroundColor: "#3a3a68",
							padding: "10px",
							borderRadius: "5px",
							paddingInline: "30px",
							paddingBlock: "40px",
							fontWeight: 400,
							fontFamily: "Marianne",
							fontSize: "16px",
							lineHeight: "24px",
						}}
					>
						<span>
							Derniere mise a jour:{" "}
							<strong>
								{declaration?.updatedAt
									? new Date(declaration.updatedAt).toLocaleString()
									: "N/A"}
							</strong>
						</span>
						{declaration?.updatedAt > declaration?.published_at && (
							<Button
								iconId="fr-icon-edit-box-fill"
								priority="primary"
								style={{ width: "100%" }}
							>
								Mettre à jour
							</Button>
						)}
					</div>
				</div>
			)}
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					gap: "1rem",
					justifyContent: "center",
				}}
			>
				<Tile
					desc="Informations à propos du service et l’administration à laquelle il est lié"
					title="Informations générales"
					linkProps={{
						href: `/declaration/${declaration?.id}/infos`,
					}}
					enlargeLinkOrButton={true}
					orientation="horizontal"
				/>
				<Tile
					title="Schéma et plans d'actions"
					desc="État des lieux et actions prévues pour améliorer l'accessibilité"
					linkProps={{
						href: `/declaration/${declaration?.id}/schema`,
					}}
					enlargeLinkOrButton={false}
					orientation="horizontal"
					start={
						declaration?.actionPlan ? null : (
							<Badge noIcon severity="new">
								A Remplir
							</Badge>
						)
					}
				/>
				<Tile
					title="Résultat de l’audit"
					desc="Taux de conformité et détails de l'audit"
					linkProps={{
						href: `/declaration/${declaration?.id}/audit`,
					}}
					enlargeLinkOrButton={false}
					orientation="horizontal"
					start={
						declaration?.audit ? null : (
							<Badge noIcon severity="new">
								A Remplir
							</Badge>
						)
					}
				/>
				<Tile
					title="Contact"
					desc="Moyen de contact pour pouvoir accéder aux éventuels contenus inaccessibles"
					linkProps={{
						href: `/declaration/${declaration?.id}/contact`,
					}}
					enlargeLinkOrButton={false}
					orientation="horizontal"
					start={
						declaration?.contact ? null : (
							<Badge noIcon severity="new">
								A Remplir
							</Badge>
						)
					}
				/>
			</div>
		</section>
	);
}

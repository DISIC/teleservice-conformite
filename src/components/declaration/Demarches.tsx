import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

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
			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
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
						<strong>73%</strong>
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
					Derniere mise a jour: <strong>XX/XX/2025</strong>
				</div>
			</div>
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
					title="Schéma et plans d'actions"
					desc="État des lieux et actions prévues pour améliorer l'accessibilité"
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
					title="Résultat de l’audit"
					desc="Taux de conformité et détails de l'audit"
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
					desc="Moyen de contact pour pouvoir accéder aux éventuels contenus inaccessibles"
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

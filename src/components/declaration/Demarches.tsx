import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import type { Declaration } from "payload/payload-types";

interface DemarchesProps {
	declaration: Declaration | null;
}

export default function Demarches({ declaration }: DemarchesProps) {
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

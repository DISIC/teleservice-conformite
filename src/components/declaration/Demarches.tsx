import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Document from "@codegouvfr/react-dsfr/picto/Document";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import Community from "@codegouvfr/react-dsfr/picto/Community";

import type { Declaration } from "payload/payload-types";

interface DemarchesProps {
	declaration: Declaration | null;
}

export default function Demarches({ declaration }: DemarchesProps) {
	const { classes } = useStyles();

	return (
		<section id="demarches-tab" className={classes.main}>
			{declaration?.audit?.rate && (
				<div className={classes.summaryCardsContainer}>
					<div className={classes.summaryRateCard}>
						<p className={classes.rateLabel}>Taux de conformite</p>
						<p className={classes.rateValue}>
							<strong>
								{declaration?.audit?.rate
									? `${declaration.audit.rate}%`
									: "N/A"}
							</strong>
						</p>
					</div>
					<div className={classes.updateDateLabel}>
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
			<div className={classes.tilesContainer}>
				<Tile
					desc="Informations à propos du service et l’administration à laquelle il est lié"
					title="Informations générales"
					linkProps={{
						href: `/declaration/${declaration?.id}/infos`,
					}}
					enlargeLinkOrButton={true}
					orientation="vertical"
					pictogram={<Document fontSize="2rem" />}
				/>
				<Tile
					title="Schéma et plans d'actions"
					desc="État des lieux et actions prévues pour améliorer l'accessibilité"
					linkProps={{
						href: `/declaration/${declaration?.id}/schema`,
					}}
					enlargeLinkOrButton={false}
					orientation="vertical"
					pictogram={<Conclusion fontSize="2rem" />}
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
					orientation="vertical"
					pictogram={<Search fontSize="2rem" />}
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
					orientation="vertical"
					pictogram={<Community fontSize="2rem" />}
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

const useStyles = tss.withName(Demarches.name).create({
	main: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("8v"),
	},
	summaryCardsContainer: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: fr.spacing("4v"),
	},
	summaryRateCard: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("3v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.hover,
		paddingInline: fr.spacing("7v"),
		paddingBlock: fr.spacing("10v"),
		borderRadius: "0.375rem",
		justifyContent: "space-between",
	},
	rateLabel: {
		margin: 0,
		fontWeight: 400,
		fontFamily: "Marianne",
		fontSize: "1rem",
		lineHeight: "1.5rem",
	},
	rateValue: {
		margin: 0,
		fontWeight: 400,
		fontFamily: "Marianne",
		fontSize: "1rem",
		lineHeight: "1.5rem",
	},
	updateDateLabel: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("3v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.hover,
		padding: fr.spacing("3v"),
		borderRadius: "0.375rem",
		paddingInline: fr.spacing("7v"),
		paddingBlock: fr.spacing("10v"),
		fontWeight: 400,
		fontFamily: "Marianne",
		fontSize: "1rem",
		lineHeight: "1.5rem",
	},
	tilesContainer: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("4v"),
		justifyContent: "center",
	},
});

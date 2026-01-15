import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Document from "@codegouvfr/react-dsfr/picto/Document";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import Community from "@codegouvfr/react-dsfr/picto/Community";
import { useRouter } from "next/router";

import type { PopulatedDeclaration } from "~/utils/payload-helper";

interface DemarchesProps {
	declaration: PopulatedDeclaration;
}

export default function Demarches({ declaration }: DemarchesProps) {
	const router = useRouter();
	const { classes } = useStyles();
	const { rate } = declaration?.audit || {};

	const wasUpdated =
		declaration?.updatedAt &&
		declaration?.published_at &&
		declaration?.updatedAt > declaration?.published_at;

	return (
		<section id="demarches-tab" className={classes.main}>
			{declaration.status === "published" && (
				<div className={classes.summaryCardsContainer}>
					<div className={classes.summaryRateCard}>
						<p className={classes.cardLabel}>Taux de conformité</p>
						<p className={classes.cardValue}>{`${rate}%`}</p>
					</div>
					<div className={classes.summaryUpdateDateCard}>
						<p className={classes.cardLabel}>Dernière mise à jour</p>
						<p className={classes.cardValue}>
							{declaration?.updatedAt
								? new Date(declaration.updatedAt).toLocaleDateString("fr-FR")
								: "N/A"}
						</p>
						{wasUpdated && (
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
						href: `/dashboard/declaration/${declaration?.id}/infos`,
					}}
					enlargeLinkOrButton={true}
					orientation="vertical"
					pictogram={<Document fontSize="2rem" />}
					className={classes.tile}
				/>
				<Tile
					title="Contact"
					desc="Moyen de contact pour pouvoir accéder aux éventuels contenus inaccessibles"
					linkProps={{
						href: `/dashboard/declaration/${declaration?.id}/contact`,
					}}
					enlargeLinkOrButton={!!declaration?.contact}
					orientation="vertical"
					pictogram={<Community fontSize="2rem" />}
					start={
						declaration?.contact ? null : (
							<Badge noIcon severity="new">
								A Remplir
							</Badge>
						)
					}
					detail={
						declaration?.contact ? null : (
							<Button
								onClick={() =>
									router.push(
										`/dashboard/declaration/${declaration?.id}/contact`,
									)
								}
							>
								Renseigner les informations
							</Button>
						)
					}
					className={classes.tile}
				/>
				<Tile
					title="Résultat de l’audit"
					desc="Taux de conformité et détails de l'audit"
					linkProps={{
						href: `/dashboard/declaration/${declaration?.id}/audit`,
					}}
					enlargeLinkOrButton={!!declaration?.audit}
					orientation="vertical"
					pictogram={<Search fontSize="2rem" />}
					start={
						declaration?.audit ? null : (
							<Badge noIcon severity="new">
								A Remplir
							</Badge>
						)
					}
					detail={
						declaration?.audit ? null : (
							<Button
								onClick={() =>
									router.push(`/dashboard/declaration/${declaration?.id}/audit`)
								}
							>
								Renseigner les informations
							</Button>
						)
					}
					className={classes.tile}
				/>
				<Tile
					title="Schéma et plans d'actions"
					desc="État des lieux et actions prévues pour améliorer l'accessibilité"
					linkProps={{
						href: `/dashboard/declaration/${declaration?.id}/schema`,
					}}
					enlargeLinkOrButton={!!declaration?.actionPlan}
					orientation="vertical"
					pictogram={<Conclusion fontSize="2rem" />}
					start={
						declaration?.actionPlan ? null : (
							<Badge noIcon severity="new">
								A Remplir
							</Badge>
						)
					}
					detail={
						declaration?.actionPlan ? null : (
							<Button
								onClick={() =>
									router.push(
										`/dashboard/declaration/${declaration?.id}/schema`,
									)
								}
							>
								Renseigner les informations
							</Button>
						)
					}
					className={classes.tile}
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
	summaryUpdateDateCard: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("3v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.hover,
		paddingInline: fr.spacing("7v"),
		paddingBlock: fr.spacing("10v"),
		borderRadius: "0.375rem",
		justifyContent: "flex-start",
	},
	cardLabel: {
		margin: 0,
		fontWeight: 400,
		fontFamily: "Marianne",
		fontSize: "1rem",
		lineHeight: "1.5rem",
	},
	cardValue: {
		margin: 0,
		fontWeight: 500,
		fontFamily: "Marianne",
		fontSize: "1.25rem",
		lineHeight: "1.75rem",
	},
	tilesContainer: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr 1fr 1fr",
		gap: fr.spacing("4v"),
	},
	tile: {
		"& a": {
			backgroundImage: "none !important",
			"&::after": {
				display: "none",
			},
		},
		"& h3": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});

import MentalDisabilities from "@codegouvfr/react-dsfr/picto/MentalDisabilities";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import Document from "@codegouvfr/react-dsfr/picto/Document";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import DataVisualization from "@codegouvfr/react-dsfr/picto/DataVisualization";
import FlowList from "@codegouvfr/react-dsfr/picto/FlowList";
import Notification from "@codegouvfr/react-dsfr/picto/Notification";
import Innovation from "@codegouvfr/react-dsfr/picto/Innovation";

const ToolAdvantages = () => {
	const { classes } = useStyles();

	const list = [
		{
			title: "Déclaration conforme",
			description:
				"Votre déclaration est générée selon le format réglementaire et toujours conforme aux exigences légales.",
			iconPosition: "right",
			Icon: DataVisualization,
		},
		{
			title: "Déclarations centralisées",
			description:
				"Regroupez toutes vos déclarations au même endroit et facilitez le travail en équipe.",
			iconPosition: "left",
			Icon: FlowList,
		},
		{
			title: "Rappels automatiques",
			description:
				"Recevez automatiquement une alerte quand une déclaration arrive à échéance.",
			iconPosition: "right",
			Icon: Notification,
		},
		{
			title: "En 1 clic avec Ara",
			description:
				"Si vous utilisez l’outil Ara pour réaliser votre audit, récupérez en un clic les données de votre déclaration existante pour pré-remplir automatiquement la nouvelle.",
			iconPosition: "left",
			Icon: Innovation,
		},
	];

	return (
		<div className={classes.advantagesContainer}>
			<h3>Profitez des avantages de l’outil</h3>
			{list.map(({ title, description, Icon, iconPosition }) => (
				<div key={title} data-iconPosition={iconPosition}>
					<div>
						<h4>{title}</h4>
						<p>{description}</p>
					</div>
					<Icon fontSize="10rem" />
				</div>
			))}
		</div>
	);
};

export default function AddFirstDeclaration() {
	const router = useRouter();
	const { classes } = useStyles();

	return (
		<section className={classes.main}>
			<div className={classes.header}>
				<h1>Téléservice de déclaration d’accessibilité</h1>
				<MentalDisabilities fontSize="8rem" />
			</div>
			<div className={classes.body}>
				<p>
					Ce service a été créé pour garantir la conformité et assurer que
					toutes les déclarations soient produites selon les mêmes standards.
					<br />
					Tous les sites et applications en production doivent être référencés
					dans l’outil, y compris ceux qui n’ont pas encore fait l’objet d’un
					audit d’accessibilité.
				</p>
				<div>
					<div className={classes.infoSection}>
						<h2>Créez la déclaration pour votre service</h2>
						<p>
							<strong>
								Vous devez réaliser une déclaration par service et par type de
								support.
							</strong>
							<br />
							<br />
							Par exemple, pour le service Choisir{" "}
							<strong>le service public</strong>, vous devrez faire une
							déclaration pour le site web, une autre pour l’application mobile
							iOs et une dernière pour l’application mobile Android.
						</p>
						<div>
							<Conclusion fontSize="3rem" />
							<p>
								Durée de complétion estimée :{" "}
								<strong>Entre 6 et 15 minutes</strong>
							</p>
						</div>
					</div>
					<div className={classes.documentsSection}>
						<Document fontSize="5rem" />
						<p className={classes.documentsSectionTitle}>
							<strong>Documents à préparer</strong>
						</p>
						<ul>
							<li>
								<p>
									<strong>Votre déclaration d’accessibilité existante</strong>
								</p>
								<p>si vous en avez une</p>
							</li>
							<li>
								<p>
									<strong>Votre grille et rapport d’audit</strong>
								</p>
								<p>si vous en avez une</p>
							</li>
							<li>
								<p>
									<strong>Le fichier ou l’URL du schéma annuel</strong>
								</p>
								<p>si vous en avez une</p>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div className={classes.buttonContainer}>
				<Button
					priority="primary"
					linkProps={{
						href: "/dashboard/form",
					}}
				>
					Créer la déclaration
				</Button>
			</div>
			<ToolAdvantages />
		</section>
	);
}

const useStyles = tss.withName(AddFirstDeclaration.name).create({
	main: {
		marginBottom: fr.spacing("20v"),
	},
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginInline: "calc(50% - 50vw)",
		width: "100vw",
		maxWidth: "100vw",
		paddingInline: fr.spacing("8w"),
		paddingBlock: fr.spacing("5w"),
		backgroundColor: fr.colors.decisions.artwork.background.blueFrance.default,
	},
	body: {
		paddingInline: fr.spacing("8w"),

		"& > p": {
			marginBlock: fr.spacing("8w"),
			fontWeight: 400,
			fontFamily: "Marianne",
			fontSize: "1.25rem",
			lineHeight: "2rem",
		},

		"& > div": {
			display: "grid",
			gridTemplateColumns: "auto auto",
		},
	},
	infoSection: {
		padding: fr.spacing("4w"),
		backgroundColor: fr.colors.decisions.artwork.background.blueFrance.default,

		"& > h2": {
			fontWeight: 700,
			fontFamily: "Marianne",
		},

		"& > div": {
			display: "flex",
			flexDirection: "row",
			gap: fr.spacing("2w"),
			alignItems: "center",

			"& > p": {
				margin: 0,
			},
		},
	},
	documentsSection: {
		padding: fr.spacing("4w"),
		color: fr.colors.decisions.background.default.grey.default,
		backgroundColor:
			fr.colors.decisions.background.actionHigh.blueFrance.default,

		"& .fr-artwork-major": {
			fill: "#ffffff !important",
		},

		"& ul": {
			margin: 0,
			padding: 0,

			"& li": {
				listStyleType: "none",
				marginBottom: fr.spacing("2w"),
				"& > p": { margin: 0 },
			},
		},
	},
	documentsSectionTitle: {
		fontSize: "1.1rem",
	},
	buttonContainer: {
		display: "flex",
		justifyContent: "center",
		marginBlock: fr.spacing("4w"),
	},
	advantagesContainer: {
		"& > div": {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: fr.spacing("25v"),

			"&[data-iconPosition='left']": {
				flexDirection: "row-reverse",
			},
			"&[data-iconPosition='right']": {
				flexDirection: "row",
			},

			"& > div": {
				width: "25rem",
				"& > p, > h4": { margin: 0 },
			},
		},
		marginTop: fr.spacing("20v"),
		justifyContent: "center",
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("24v"),
	},
});

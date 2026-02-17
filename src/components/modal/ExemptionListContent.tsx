import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

export default function ExemptionListModalContent() {
	const { classes, cx } = useStyles();

	return (
		<section className={classes.modal}>
			<div className={classes.headingContainer}>
				<i className={cx("fr-icon-question-line", classes.infoIcon)} />
				<h1 className={classes.heading}>
					Liste des contenus non soumis à l’obligation d’accessibilité
				</h1>
			</div>
			<p>
				<strong>
					Certaines catégories de contenus ne sont pas soumises à l’obligation
					d’accessibilité.
				</strong>
				Elles sont considérées comme hors champ de la réglementation :
			</p>
			<ul>
				<li>
					<p>
						Les fichiers bureautiques publiés avant le 23 septembre 2018, sauf
						s’ils sont indispensables pour réaliser une démarche administrative.
					</p>
				</li>
				<li>
					<p>
						Les contenus audio et vidéo préenregistrés publiés avant le 23
						septembre 2020
					</p>
				</li>
				<li>
					<p>Les contenus audio et vidéo diffusés en direct</p>
				</li>
				<li>
					<p>
						Les cartes interactives et services de cartographie, à condition que
						les informations essentielles (par exemple un itinéraire) soient
						fournies sous une forme accessible
					</p>
				</li>
				<li>
					<p>
						Les contenus produits par des tiers (non financés, non développés et
						non contrôlés par l’organisme) Les reproductions de pièces
						patrimoniales qui ne peuvent pas être rendues accessibles, soit pour
						préserver l’authenticité de l’œuvre, soit parce qu’il n’existe pas
						de solution simple et économique pour les transcrire.
					</p>
				</li>
				<li>
					<p>
						Les contenus des intranets et extranets publiés avant le 23
						septembre 2019, tant qu’ils n’ont pas été entièrement revus.
					</p>
				</li>
				<li>
					<p>
						Les contenus de sites ou d’applications qui ne sont pas nécessaires
						à une démarche administrative et qui n’ont pas été mis à jour depuis
						le 23 septembre 2019, notamment les archives.
					</p>
				</li>
			</ul>
			<p>
				Enfin, jusqu’à l’entrée en vigueur du décret de 2019, l’État, les
				collectivités et leurs établissements restaient soumis aux anciennes
				règles d’accessibilité de 2009.
			</p>
		</section>
	);
}

const useStyles = tss.withName("ExemptionListModalContent").create({
	headingContainer: {
		marginBottom: fr.spacing("5w"),
		paddingBottom: fr.spacing("3w"),
		borderBottom: `1px solid ${fr.colors.decisions.text.title.blueFrance.default}`,
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("2v"),
	},
	heading: {
		margin: 0,
		color: fr.colors.decisions.text.title.blueFrance.default,
		fontSize: fr.typography[3].style.fontSize,
		lineHeight: fr.typography[3].style.lineHeight,
		fontWeight: 700,
	},
	modal: {
		padding: fr.spacing("4v"),
		color: fr.colors.decisions.text.title.grey.default,

		"& > ul": {
			"& > li": {
				marginBlock: fr.spacing("5v"),
			},
		},
	},
	infoIcon: {
		color: fr.colors.decisions.text.title.blueFrance.default,
		display: "flex",

		"&::before": {
			width: fr.spacing("8v"),
			height: fr.spacing("8v"),
		},
	},
});

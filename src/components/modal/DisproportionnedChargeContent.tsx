import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
// import { Icon } from "@codegouvfr/react-dsfr/Icon";

export default function DisproportionnedChargeContent() {
	const { classes } = useStyles();

	return (
		<section className={classes.modal}>
			<div className={classes.headingContainer}>
				{/* <Icon iconId="fr-icon-information-line" /> */}
				<h3 className={classes.heading}>
					Qu’est-ce qu’une charge disproportionnée ?
				</h3>
			</div>
			<p>
				Un organisme peut invoquer une dérogation pour charge disproportionnée
				lorsqu’il lui est
				<strong>
					impossible de rendre un contenu ou une fonctionnalité accessible sans
					compromettre
				</strong>
				sa mission de service public ou ses objectifs économiques.
				<br />
				Cette dérogation s’applique au cas par cas et doit rester
				exceptionnelle.
			</p>
			<div className={classes.example}>
				<p>
					<strong>Exemple</strong>
					<br /> Une petite mairie propose un parcours de santé en extérieur et
					met à disposition une carte d’orientation avec des courbes de niveau,
					très complexe à rendre accessible pour une personne aveugle.
					<br />
					<br />
					L’alternative pourrait être une carte imprimée en 3D ou une
					application mobile de géolocalisation, mais le prix serait trop élevé
					pour une petite commune.
				</p>
			</div>
			<p>Lorsque la dérogation est utilisée :</p>
			<ul>
				<li>
					<p>
						le contenu ou la fonctionnalité concerné(e) doit être accompagné(e)
						d’une alternative accessible, sauf si produire cette alternative
						constitue elle-même une charge disproportionnée ;
					</p>
				</li>
				<li>
					<p>
						pour les missions principales d’un service public, une alternative
						équivalente est obligatoire ;
					</p>
				</li>
				<li>
					<p>
						la dérogation ne peut pas porter sur l’ensemble d’un service sans
						justification.
					</p>
				</li>
			</ul>
			<p>
				Pour évaluer la charge disproportionnée, l’organisme prend en compte :
			</p>
			<ul>
				<li>
					<p>
						sa taille, ses ressources, la nature de ses missions ; les coûts
						(investissement, fonctionnement, temps requis) ;
					</p>
				</li>
				<li>
					<p>
						l’avantage pour les usagers handicapés et la fréquence d’usage du
						service.
					</p>
				</li>
			</ul>
			<p>
				Le manque de temps, de connaissance ou de priorité ne constitue pas un
				motif valable.
				<br />
				La dérogation <strong>doit être documentée</strong> dans la déclaration
				d’accessibilité : justification, durée, éléments concernés et
				alternatives proposées.
			</p>
		</section>
	);
}

const useStyles = tss.withName("DisproportionnedChargeContent").create({
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
	},
	modal: {
		padding: fr.spacing("4v"),
		color: fr.colors.decisions.text.title.grey.default,

		"& > ul": {
			"& > li": {
				marginBlock: fr.spacing("5v"),
				fontWeight: 400,
			},
		},
	},
	example: {
		backgroundColor: fr.colors.decisions.background.contrast.info.default,
		borderRadius: fr.spacing("1v"),
		padding: fr.spacing("6v"),
		marginBlock: fr.spacing("4v"),
	},
});

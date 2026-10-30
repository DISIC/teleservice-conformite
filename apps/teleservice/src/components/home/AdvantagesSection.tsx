import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import Community from "@codegouvfr/react-dsfr/picto/Community";
import Document from "@codegouvfr/react-dsfr/picto/Document";
import Notification from "@codegouvfr/react-dsfr/picto/Notification";
import { tss } from "tss-react";

const ADVANTAGES = [
	{
		title: "Normalisez",
		desc: "Vos déclarations sont générées au format réglementaire, conformément aux exigences légales.",
		Picto: Document,
	},
	{
		title: "Centralisez",
		desc: "Gérez vos déclarations et consultez les déclarations de votre organisation au même endroit.",
		Picto: Community,
	},
	{
		title: "Pilotez",
		desc: "Recevez automatiquement une alerte par email quand une déclaration arrive à échéance.",
		Picto: Notification,
	},
];

type AdvantagesSectionProps = {
	startHref: string;
};

export function AdvantagesSection({ startHref }: AdvantagesSectionProps) {
	const { classes, cx } = useStyles();

	return (
		<section className={classes.band}>
			<div className={cx(fr.cx("fr-container"), classes.container)}>
				<h2 className={classes.heading}>
					Les avantages du téléservice de déclaration
				</h2>
				<ul className={classes.tiles}>
					{ADVANTAGES.map(({ title, desc, Picto }) => (
						<li key={title}>
							<Tile
								title={title}
								titleAs="h3"
								desc={desc}
								pictogram={<Picto fontSize="5rem" />}
								noIcon
							/>
						</li>
					))}
				</ul>
				<Button linkProps={{ href: startHref }} size="large">
					Commencer
				</Button>
			</div>
		</section>
	);
}

const useStyles = tss.withName(AdvantagesSection.name).create({
	band: {
		backgroundColor: fr.colors.options.beigeGrisGalet._975_75.default,
		paddingBlock: fr.spacing("9w"),
	},
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: fr.spacing("4w"),
	},
	heading: {
		margin: 0,
		textAlign: "center",
	},
	tiles: {
		width: "100%",
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: fr.spacing("3w"),
		listStyle: "none",
		margin: 0,
		padding: 0,
		"& > li": {
			padding: 0,
		},
		"& .fr-tile": {
			height: "100%",
			textAlign: "center",
		},
		"@media (max-width: 992px)": {
			gridTemplateColumns: "1fr",
		},
	},
});

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
		desc: "Vos déclarations sont générées selon le format réglementaire, conformément aux exigences légales.",
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
	onStart: () => void;
};

export function AdvantagesSection({ onStart }: AdvantagesSectionProps) {
	const { classes, cx } = useStyles();

	return (
		<section className={classes.band}>
			<div className={cx(fr.cx("fr-container"), classes.container)}>
				<h2 className={classes.heading}>
					Les avantages du téléservice de déclaration
				</h2>
				<div className={classes.tiles}>
					{ADVANTAGES.map(({ title, desc, Picto }) => (
						<Tile
							key={title}
							title={title}
							titleAs="h3"
							desc={desc}
							pictogram={<Picto fontSize="5rem" />}
							noIcon
						/>
					))}
				</div>
				<Button onClick={onStart}>Commencer</Button>
			</div>
		</section>
	);
}

const useStyles = tss.withName(AdvantagesSection.name).create({
	band: {
		backgroundColor: fr.colors.options.beigeGrisGalet._975_75.default,
		paddingBlock: fr.spacing("8w"),
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
		"& .fr-tile": {
			textAlign: "center",
		},
		"@media (max-width: 992px)": {
			gridTemplateColumns: "1fr",
		},
	},
});

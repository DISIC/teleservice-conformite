"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { tss } from "tss-react";

export type TileGridItem = {
	title: string;
	description?: string;
	href: string;
};

interface TileGridProps {
	tiles: TileGridItem[];
}

export default function TileGrid({ tiles }: TileGridProps) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.tilesContainer}>
			{tiles.map(({ title, description, href }) => (
				<Tile
					key={title}
					enlargeLinkOrButton
					imageSvg
					linkProps={{ href }}
					orientation="vertical"
					title={title}
					titleAs="h2"
					className={cx("fr-h6", classes.tile)}
					desc={description}
				/>
			))}
		</div>
	);
}

const useStyles = tss.withName(TileGrid.name).create({
	tilesContainer: {
		display: "grid",
		gridTemplateColumns: "repeat(3, 1fr)",
		gap: fr.spacing("6v"),

		[fr.breakpoints.down("md")]: {
			gridTemplateColumns: "1fr",
		},

		"& .fr-tile__title a, .fr-tile__title button": {
			color: fr.colors.decisions.text.title.grey.default,
		},
	},
	tile: {
		padding: fr.spacing("6v"),

		textAlign: "left",

		"& .fr-tile__content": {
			alignItems: "flex-start",
		},
		"&.fr-tile.fr-enlarge-link:not(.fr-tile--no-icon) .fr-tile__content": {
			paddingBottom: "80px",
		},
		"& .fr-tile__title::before, & .fr-tile__title a::before": {
			backgroundImage: "none",
		},
		"& .fr-tile__title a::after": {
			backgroundColor:
				fr.colors.decisions.background.actionHigh.blueFrance.default,
		},
		"& .fr-tile__desc": {
			fontFamily: "Marianne, arial, sans-serif",
			fontWeight: 400,
			fontSize: "14px",
			lineHeight: "24px",
			letterSpacing: 0,
			color: fr.colors.decisions.text.default.grey.default,
		},
	},
});

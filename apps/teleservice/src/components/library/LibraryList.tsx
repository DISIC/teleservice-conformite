import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

export function LibraryList({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	const { classes } = useStyles();
	return (
		<>
			<h2 id={id} className={fr.cx("fr-sr-only")}>
				{title}
			</h2>
			<ul className={classes.list} aria-labelledby={id}>
				{children}
			</ul>
		</>
	);
}

const useStyles = tss.withName(LibraryList.name).create({
	list: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
		"& > li": {
			margin: 0,
			padding: 0,
		},
		"& > li > div, & dl": {
			gap: fr.spacing("8v"),
		},
	},
});

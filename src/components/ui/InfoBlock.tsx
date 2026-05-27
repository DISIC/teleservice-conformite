import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Book from "@codegouvfr/react-dsfr/picto/Book";
import type { ReactNode } from "react";
import { tss } from "tss-react";

type InfoBlockProps = {
	organizationName: string;
	title: string;
	children: ReactNode;
	picto?: ReactNode;
};

const InfoBlock = ({
	organizationName,
	title,
	children,
	picto,
}: InfoBlockProps) => {
	const { classes } = useStyles();

	return (
		<div className={classes.container}>
			<div className={classes.pictoWrapper}>
				<span className={classes.pictoAccent} aria-hidden="true" />
				<span className={classes.pictoCircle}>
					{picto ?? <Book fontSize="3rem" />}
				</span>
			</div>
			<div className={classes.content}>
				<Badge small className={classes.tag}>
					{organizationName}
				</Badge>
				<h2 className={classes.title}>{title}</h2>
				<p className={classes.description}>{children}</p>
			</div>
		</div>
	);
};

const useStyles = tss.withName(InfoBlock.name).create({
	container: {
		display: "flex",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: fr.spacing("10v"),
		padding: `${fr.spacing("6v")} ${fr.spacing("8v")}`,
		backgroundColor: fr.colors.options.blueEcume._975_75.default,
	},
	pictoWrapper: {
		position: "relative",
		flexShrink: 0,
		width: "6rem",
		height: "6rem",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	pictoAccent: {
		position: "absolute",
		inset: 0,
		borderRadius: "50%",
		background: `conic-gradient(from 0deg, ${fr.colors.options.blueEcume._925_125.default} 0deg 180deg, transparent 180deg 360deg)`,
	},
	pictoCircle: {
		position: "relative",
		width: "4.5rem",
		height: "4.5rem",
		borderRadius: "50%",
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: fr.spacing("2v"),
		flex: 1,
	},
	tag: {
		backgroundColor: fr.colors.options.blueEcume._975_75.active,
		color: fr.colors.decisions.text.actionHigh.blueEcume.default,
		fontSize: "0.675rem",
		lineHeight: "1rem",
	},
	title: {
		margin: 0,
		fontSize: fr.typography[0].style.fontSize,
		lineHeight: fr.typography[1].style.lineHeight,
	},
	description: {
		margin: 0,
		fontSize: "0.75rem",
		lineHeight: "1.25rem",
		color: fr.colors.decisions.text.title.grey.default,
	},
});

export default InfoBlock;

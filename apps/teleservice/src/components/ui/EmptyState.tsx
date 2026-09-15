import { fr } from "@codegouvfr/react-dsfr";
import { Button, type ButtonProps } from "@codegouvfr/react-dsfr/Button";
import type { ReactNode } from "react";
import { tss } from "tss-react";

type EmptyStateProps = {
	title?: string;
	description: string;
	pictogram?: ReactNode;
	children?: ReactNode;
	ctaProps?: ButtonProps.Common &
		(ButtonProps.IconOnly | ButtonProps.WithIcon | ButtonProps.WithoutIcon) &
		(ButtonProps.AsAnchor | ButtonProps.AsButton);
};

export default function EmptyState(props: EmptyStateProps) {
	const { classes } = useStyles();
	const { title, description, ctaProps, pictogram, children } = props;

	return (
		<div className={classes.emptyStateContainer}>
			{pictogram}
			{title && <h2 className={classes.emptyStateTitle}>{title}</h2>}
			<p className={classes.emptyStateDescription}>{description}</p>
			{children && <div className={classes.emptyStateBody}>{children}</div>}
			{ctaProps && (
				<Button {...ctaProps} priority="primary">
					{ctaProps.children}
				</Button>
			)}
		</div>
	);
}

const useStyles = tss.withName(EmptyState.name).create({
	emptyStateContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		padding: `${fr.spacing("10v")} ${fr.spacing("6v")}`,
	},
	emptyStateTitle: {
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: fr.typography[1].style.fontSize,
		lineHeight: fr.typography[1].style.lineHeight,
		marginBottom: 0,
	},
	emptyStateDescription: {
		fontFamily: "Marianne",
		fontWeight: 500,
		lineHeight: "2rem",
		color: fr.colors.decisions.text.default.grey.default,
		marginTop: fr.spacing("4v"),
		marginBottom: fr.spacing("8v"),
	},
	emptyStateBody: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: fr.spacing("4v"),
		maxWidth: "40rem",
		marginBottom: fr.spacing("8v"),
		"& p": { margin: 0 },
	},
});

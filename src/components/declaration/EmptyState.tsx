import { fr } from "@codegouvfr/react-dsfr";
import { Button, type ButtonProps } from "@codegouvfr/react-dsfr/Button";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { tss } from "tss-react";

type EmptyStateProps = {
	title?: string;
	description: string;
	ctaProps: ButtonProps.Common &
		(ButtonProps.IconOnly | ButtonProps.WithIcon | ButtonProps.WithoutIcon) &
		(ButtonProps.AsAnchor | ButtonProps.AsButton);
};

export default function EmptyState(props: EmptyStateProps) {
	const { classes } = useStyles();
	const { title, description, ctaProps } = props;

	return (
		<div className={classes.emptyStateContainer}>
			<Conclusion fontSize="3rem" />
			{title && <h2 className={classes.emptyStateTitle}>{title}</h2>}
			<p className={classes.emptyStateDescription}>{description}</p>
			<Button {...ctaProps} priority="primary">
				{ctaProps.children}
			</Button>
		</div>
	);
}

const useStyles = tss.withName(EmptyState.name).create({
	emptyStateContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		padding: `${fr.spacing("10v")} 0`,
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
});

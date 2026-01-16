import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

interface PopupMessageProps {
	image: React.ReactNode;
	message: string | React.ReactNode;
}

export default function PopupMessage({ image, message }: PopupMessageProps) {
	const { classes } = useStyles();

	return (
		<div className={classes.popupMessageContainer}>
			{image}
			<div>{message}</div>
		</div>
	);
}

const useStyles = tss.withName(PopupMessage.name).create({
	popupMessageContainer: {
		display: "flex",
		padding: fr.spacing("5w"),
		marginBlock: fr.spacing("2w"),
		gap: fr.spacing("5w"),
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
		fontSize: "1rem",
		lineHeight: "1.5rem",
		fontFamily: "Marianne",
	},
});

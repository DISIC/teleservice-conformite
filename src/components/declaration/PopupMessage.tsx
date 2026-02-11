import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Button from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";

interface PopupMessageProps {
	image: React.ReactNode;
	message: string | React.ReactNode;
	actionButtons?: {
		label: string;
		priority?: "primary" | "secondary";
		iconId?: FrIconClassName | RiIconClassName;
		onClick?: () => void;
	}[];
}

export default function PopupMessage({
	image,
	message,
	actionButtons,
}: PopupMessageProps) {
	const { classes } = useStyles();

	return (
		<div className={classes.popupMessageContainer}>
			{image}
			<p className={classes.messageWrapper}>{message}</p>
			<div className={classes.buttonsContainer}>
				{actionButtons?.map((button) => (
					<Button
						key={button.label}
						priority={button.priority || "primary"}
						iconId={button.iconId as any}
						onClick={button.onClick}
					>
						{button.label}
					</Button>
				))}
			</div>
		</div>
	);
}

const useStyles = tss.withName(PopupMessage.name).create({
	popupMessageContainer: {
		display: "grid",
		gridTemplateColumns: "auto 2fr 1fr",
		padding: fr.spacing("5w"),
		marginBlock: fr.spacing("2w"),
		gap: fr.spacing("5w"),
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
	},
	messageWrapper: {
		display: "flex",
		alignItems: "flex-start",
		flexDirection: "column",
		justifyContent: "center",
	},
	buttonsContainer: {
		display: "flex",
		gap: fr.spacing("4w"),
		alignItems: "center",
		justifyContent: "flex-end",
	},
});

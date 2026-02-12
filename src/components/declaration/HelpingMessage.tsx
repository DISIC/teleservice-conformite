import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Button from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";

interface HelpingMessageProps {
	image: React.ReactNode;
	message: string | React.ReactNode;
	actionButtons?: {
		label: string;
		priority?: "primary" | "secondary";
		iconId?: FrIconClassName | RiIconClassName;
		onClick?: () => void;
	}[];
}

export default function HelpingMessage({
	image,
	message,
	actionButtons,
}: HelpingMessageProps) {
	const { classes } = useStyles();

	return (
		<div className={classes.helpingMessageContainer}>
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

const useStyles = tss.withName(HelpingMessage.name).create({
	helpingMessageContainer: {
		display: "grid",
		gridTemplateColumns: "auto 2fr 1fr",
		padding: fr.spacing("6v"),
		marginBlock: fr.spacing("2w"),
		gap: fr.spacing("6v"),
		backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default,
	},
	messageWrapper: {
		display: "flex",
		alignItems: "flex-start",
		flexDirection: "column",
		justifyContent: "center",
		margin: 0,
	},
	buttonsContainer: {
		display: "flex",
		gap: fr.spacing("4w"),
		alignItems: "center",
		justifyContent: "flex-end",
	},
});

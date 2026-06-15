import { fr } from "@codegouvfr/react-dsfr";
import Button, { type ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

export interface HelpingMessageProps {
	image: React.ReactNode;
	message: string | React.ReactNode;
	actionButtons?: ButtonProps[];
	params?: { flexDirection: "column" | "row" };
}

export default function HelpingMessage({
	image,
	message,
	actionButtons,
	params,
}: HelpingMessageProps) {
	const { classes } = useStyles({
		buttonsDirection: params?.flexDirection || "row",
	});

	return (
		<div className={classes.helpingMessageContainer}>
			<div>{image}</div>
			<div className={classes.helpingMessageContent}>
				<p className={classes.messageWrapper}>{message}</p>
				{!!actionButtons?.length && (
					<div className={classes.buttonsContainer}>
						{actionButtons?.map((button) => (
							<Button
								key={button.children?.toString()}
								priority={button.priority || "primary"}
								iconId={button.iconId as any}
								onClick={button.onClick}
							>
								{button.children}
							</Button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(HelpingMessage.name)
	.withParams<{
		buttonsDirection: "column" | "row";
	}>()
	.create(({ buttonsDirection }) => ({
		helpingMessageContainer: {
			display: "flex",
			alignItems: "center",
			padding: fr.spacing("6v"),
			gap: fr.spacing("6v"),
			backgroundColor:
				fr.colors.decisions.background.contrast.blueFrance.default,
		},
		helpingMessageContent: {
			width: "100%",
			display: "flex",
			justifyContent: "space-between",
			flexDirection: buttonsDirection,
			gap: fr.spacing("4v"),
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
			gap: fr.spacing("4v"),
			alignItems: "center",
			justifyContent: buttonsDirection === "column" ? "flex-start" : "flex-end",
		},
	}));

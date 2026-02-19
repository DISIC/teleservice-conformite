import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";
import { tss } from "tss-react";

interface HelpingMessageProps {
	title?: string;
	image: React.ReactNode;
	message: string | React.ReactNode;
	actionButtons?: {
		label: string;
		priority?: "primary" | "secondary";
		iconId?: FrIconClassName | RiIconClassName;
		onClick?: () => void;
	}[];
	buttonsAlignment?: "vertical" | "horizontal";
}

export default function HelpingMessage({
	title,
	image,
	message,
	actionButtons,
	buttonsAlignment = "vertical",
}: HelpingMessageProps) {
	const { classes } = useStyles({ buttonsAlignment });

	return (
		<div className={classes.container}>
			{title && <p className={fr.cx("fr-text--lg")}>{title}</p>}
			<div className={classes.body}>
				{image}
				<div className={classes.messageWrapper}>
					<p>{message}</p>
					{!!actionButtons?.length && (
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
					)}
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(HelpingMessage.name)
	.withParams<{ buttonsAlignment?: "vertical" | "horizontal" }>()
	.create(({ buttonsAlignment }) => ({
		container: {
			display: "flex",
			flexDirection: "column",
			padding: fr.spacing("6v"),
			marginBlock: fr.spacing("2w"),
			gap: fr.spacing("4v"),
			backgroundColor:
				fr.colors.decisions.background.contrast.blueFrance.default,

			"& > p": {
				margin: 0,
				fontWeight: 700,
			},
		},
		body: {
			display: "grid",
			gap: fr.spacing("6v"),

			"@media (min-width: 830px)": {
				gridTemplateColumns: "auto 1fr",
			},
		},
		messageWrapper: {
			display: "grid",
			alignItems: "center",
			gap: fr.spacing("4v"),
			"@media (min-width: 830px)": {
				...(buttonsAlignment === "vertical"
					? { gridTemplateColumns: "1fr auto" }
					: { gridTemplateRows: "auto auto" }),
			},

			"& > p": {
				margin: 0,
			},
		},
		buttonsContainer: {
			display: "flex",
			gap: fr.spacing("4w"),
			alignItems: "center",
		},
	}));

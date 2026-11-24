import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Button, type ButtonProps } from "@codegouvfr/react-dsfr/Button";
import type { ReactNode } from "react";
import { tss } from "tss-react";

export type FaqItem = {
	question: string;
	answer: ReactNode;
};

type EmptyStateProps = {
	title?: string;
	titleAs?: "h1" | "h2";
	description: string;
	pictogram?: ReactNode;
	children?: ReactNode;
	faq?: FaqItem[];
	ctaProps?: ButtonProps.Common &
		(ButtonProps.IconOnly | ButtonProps.WithIcon | ButtonProps.WithoutIcon) &
		(ButtonProps.AsAnchor | ButtonProps.AsButton);
};

export default function EmptyState(props: EmptyStateProps) {
	const { classes, cx } = useStyles();
	const {
		title,
		titleAs: Title = "h2",
		description,
		ctaProps,
		pictogram,
		children,
		faq,
	} = props;

	return (
		<div className={classes.emptyStateContainer}>
			<div className={classes.emptyStateIntro}>
				{pictogram}
				{title && (
					<Title className={cx(classes.emptyStateTitle, "fr-h5")}>
						{title}
					</Title>
				)}
				<p
					className={cx(
						classes.emptyStateDescription,
						"fr-mt-1v",
						"fr-text--xs",
					)}
				>
					{description}
				</p>
			</div>
			{children && <div className={classes.emptyStateBody}>{children}</div>}
			{ctaProps && (
				<Button {...ctaProps} priority="primary">
					{ctaProps.children}
				</Button>
			)}
			{faq && faq.length > 0 && (
				<div
					className={cx(fr.cx("fr-accordions-group"), classes.emptyStateFaq)}
					data-fr-group="false"
				>
					{faq.map(({ question, answer }) => (
						<Accordion
							key={question}
							label={question}
							titleAs={Title === "h1" ? "h2" : "h3"}
						>
							<div className={classes.emptyStateFaqAnswer}>{answer}</div>
						</Accordion>
					))}
				</div>
			)}
		</div>
	);
}

const CONTENT_MAX_WIDTH = "39rem";

const useStyles = tss.withName({ EmptyState }).create({
	emptyStateContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		padding: `${fr.spacing("10v")} ${fr.spacing("6v")}`,
	},
	emptyStateIntro: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		width: "100%",
		maxWidth: `calc(${CONTENT_MAX_WIDTH} * 0.9)`,
	},
	emptyStateTitle: {
		marginBottom: 0,
		marginTop: fr.spacing("4v"),
	},
	emptyStateDescription: {
		color: fr.colors.decisions.text.default.grey.default,
		marginTop: 0,
		marginBottom: fr.spacing("8v"),
	},
	emptyStateBody: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: fr.spacing("4v"),
		maxWidth: CONTENT_MAX_WIDTH,
		"& p": { margin: 0 },
	},
	emptyStateFaq: {
		width: "100%",
		maxWidth: CONTENT_MAX_WIDTH,
		textAlign: "left",
		marginTop: fr.spacing("8v"),
	},
	emptyStateFaqAnswer: {
		"& p": { margin: 0 },
		"& a": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});

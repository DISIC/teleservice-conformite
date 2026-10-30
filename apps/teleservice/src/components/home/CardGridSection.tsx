import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import { newTabLinkProps } from "~/lib/newTabLink";

export type CardGridItem = {
	title: ReactNode;
	description: string;
	linkLabel?: string;
	href?: string;
};

type CardGridSectionProps = {
	heading: string;
	items: CardGridItem[];
	alert: string;
	classes?: Partial<Record<"heading" | "cardLink", string>>;
};

export function CardGridSection({
	heading,
	items,
	alert,
	classes: classesOverrides,
}: CardGridSectionProps) {
	const { classes, cx } = useStyles({ classesOverrides });

	return (
		<section className={cx(fr.cx("fr-container"), classes.section)}>
			<h2 className={classes.heading}>{heading}</h2>
			<div className={classes.content}>
				<ul className={classes.list}>
					{items.map(({ title, description, linkLabel, href }) => (
						<li key={description} className={classes.card}>
							<h3 className={fr.cx("fr-mb-4v")}>{title}</h3>
							<p className={classes.cardText}>{description}</p>
							<a
								href={href}
								{...(linkLabel && newTabLinkProps(linkLabel))}
								className={cx(
									fr.cx("fr-link", "fr-link--sm"),
									classes.cardLink,
								)}
							>
								{linkLabel}
							</a>
						</li>
					))}
				</ul>
				<Alert description={alert} severity="warning" small />
			</div>
		</section>
	);
}

const useStyles = tss.withName(CardGridSection.name).create({
	section: {
		display: "grid",
		gridTemplateColumns: "3fr 7fr",
		alignItems: "center",
		gap: fr.spacing("7w"),
		paddingBlock: fr.spacing("9w"),
		"@media (max-width: 992px)": {
			gridTemplateColumns: "1fr",
			gap: fr.spacing("4w"),
			paddingBlock: fr.spacing("6w"),
		},
	},
	heading: {
		margin: 0,
		paddingRight: fr.spacing("10w"),
		"@media (max-width: 992px)": {
			paddingRight: 0,
		},
	},
	content: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4w"),
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "grid",
		gridTemplateColumns: "repeat(2, 1fr)",
		gap: fr.spacing("4w"),
		"@media (max-width: 768px)": {
			gridTemplateColumns: "1fr",
		},
	},
	card: {
		display: "flex",
		flexDirection: "column",
		padding: fr.spacing("10v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	cardText: {
		margin: 0,
	},
	cardLink: {
		marginTop: "auto",
		paddingTop: fr.spacing("12v"),
		alignSelf: "flex-start",
		color: fr.colors.decisions.text.mention.grey.default,
		backgroundImage: "none",
		"::after": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});

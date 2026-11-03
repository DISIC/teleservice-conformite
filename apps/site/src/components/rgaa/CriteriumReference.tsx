"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Tag from "@codegouvfr/react-dsfr/Tag";
import type { Appendix, Reference } from "@rgaa/content";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import { renderMarkdown } from "./helpers/markdown";
import {
	enClause,
	isWcag,
	techniqueUrl,
	wcagSuccessCriterionUrl,
} from "./helpers/references";

type CriteriumReferenceProps = {
	criteriumNumber: string;
	appendix?: Appendix;
	accordionBackgroundColor: string;
};

const EN_301_549_TITLE = "EN 301 549 V2.1.2 (2018-08) (en anglais)";

function groupByStandard(references: Reference[]) {
	const groups = new Map<string, Reference[]>();
	for (const reference of references) {
		const group = groups.get(reference.standard);
		if (group) group.push(reference);
		else groups.set(reference.standard, [reference]);
	}
	return [...groups];
}

export default function CriteriumReference({
	criteriumNumber,
	appendix,
	accordionBackgroundColor,
}: CriteriumReferenceProps) {
	const { classes: accordionClasses } = useAccordionStyles({
		accordionBackgroundColor,
	});
	const { classes } = useStyles();

	if (!appendix) return null;

	const {
		references = [],
		techniques = [],
		technicalNotes,
		particularCases,
	} = appendix;
	const groups = groupByStandard(references);
	const hasEnGroup = groups.some(([standard]) =>
		standard.startsWith("EN 301 549"),
	);
	const enClauses = hasEnGroup
		? []
		: references
				.filter(({ standard }) => isWcag(standard))
				.flatMap((reference) => enClause(reference) ?? []);

	return (
		<div data-accordion="reference">
			<Accordion
				titleAs="h4"
				label={`Notes et références du critère ${criteriumNumber}`}
				className={accordionClasses.referenceAccordion}
			>
				<div className={classes.root}>
					{groups.length > 0 && (
						<section className={classes.section}>
							<AppendixTitle icon="fr-icon-book-2-line" title="Références" />
							{groups.map(([standard, group]) => (
								<StandardGroup key={standard} title={standard}>
									<SuccessCriteriaField
										references={group}
										linked={isWcag(standard)}
									/>
									{isWcag(standard) && techniques.length > 0 && (
										<TechniquesField techniques={techniques} />
									)}
								</StandardGroup>
							))}
							{enClauses.length > 0 && (
								<StandardGroup title={EN_301_549_TITLE}>
									<div className={classes.prose}>
										<ul>
											{enClauses.map((clause) => (
												<li key={clause}>{clause}</li>
											))}
										</ul>
									</div>
								</StandardGroup>
							)}
						</section>
					)}

					{technicalNotes && (
						<section className={classes.section}>
							<AppendixTitle
								icon="fr-icon-draft-line"
								title="Notes techniques"
							/>
							<div className={classes.prose}>
								{renderMarkdown(technicalNotes)}
							</div>
						</section>
					)}

					{particularCases && (
						<section className={classes.section}>
							<AppendixTitle
								icon="fr-icon-braces-line"
								title="Cas particuliers"
							/>
							<div className={classes.prose}>
								{renderMarkdown(particularCases)}
							</div>
						</section>
					)}
				</div>
			</Accordion>
		</div>
	);
}

function AppendixTitle({ icon, title }: { icon: string; title: string }) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.title}>
			<span className={cx(icon, classes.titleIcon)} aria-hidden />
			<h5 className={cx(classes.titleText, "fr-text--lg")}>{title}</h5>
		</div>
	);
}

function StandardGroup({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.group}>
			<h6 className={cx(classes.standard, "fr-text--md")}>{title}</h6>
			<div className={classes.groupBody}>{children}</div>
		</div>
	);
}

function SuccessCriteriaField({
	references,
	linked,
}: {
	references: Reference[];
	linked: boolean;
}) {
	const { classes } = useStyles();

	return (
		<TagField label="Critère(s) de succès :">
			{references.map((reference) => {
				const label = reference.level
					? `${reference.reference} (${reference.level})`
					: reference.reference;
				return linked ? (
					<Tag
						key={reference.reference}
						linkProps={externalLinkProps(
							wcagSuccessCriterionUrl(reference),
							`${label} ${reference.title}`,
						)}
						className={classes.tag}
					>
						{label}
					</Tag>
				) : (
					<Tag key={reference.reference} className={classes.tag}>
						{`${label} ${reference.title}`}
					</Tag>
				);
			})}
		</TagField>
	);
}

function TechniquesField({ techniques }: { techniques: string[] }) {
	const { classes } = useStyles();

	return (
		<TagField label="Technique(s) suffisante(s) et/ou échec(s) (en anglais) :">
			{techniques.map((technique) => (
				<Tag
					key={technique}
					linkProps={externalLinkProps(techniqueUrl(technique), technique)}
					className={classes.tag}
				>
					{technique}
				</Tag>
			))}
		</TagField>
	);
}

function externalLinkProps(href: string, label: string) {
	return {
		href,
		target: "_blank",
		rel: "noopener noreferrer",
		title: `${label} - nouvelle fenêtre`,
	};
}

function TagField({ label, children }: { label: string; children: ReactNode }) {
	const { classes } = useStyles();

	return (
		<div className={classes.field}>
			<p className={classes.fieldLabel}>{label}</p>
			<div className={classes.tags}>{children}</div>
		</div>
	);
}

const useAccordionStyles = tss
	.withName(CriteriumReference.name)
	.withParams<{ accordionBackgroundColor: string }>()
	.create(({ accordionBackgroundColor }) => ({
		referenceAccordion: {
			marginLeft: fr.spacing("13v"),

			[fr.breakpoints.down("md")]: {
				marginLeft: 0,
			},

			"& > .fr-accordion__title > .fr-accordion__btn": {
				fontFamily: "Marianne",
				fontWeight: 400,
				fontSize: "20px",
				lineHeight: "32px",
				letterSpacing: 0,
				color: fr.colors.decisions.text.title.grey.default,
			},

			"& > .fr-collapse": {
				margin: 0,
			},

			"& > .fr-accordion__title > .fr-accordion__btn[aria-expanded='true']": {
				backgroundColor: accordionBackgroundColor,
			},
		},
	}));

const useStyles = tss.withName("CriteriumReferenceAppendix").create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("5w"),
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		padding: fr.spacing("4w"),
		[fr.breakpoints.down("md")]: {
			padding: fr.spacing("2w"),
		},
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
	},
	title: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("1w"),
		paddingBottom: fr.spacing("1w"),
		borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
	},
	titleIcon: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		"&::before": {
			width: "24px",
			height: "24px",
		},
	},
	titleText: {
		flex: 1,
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: "20px",
		lineHeight: "28px",
		letterSpacing: 0,
		color: fr.colors.decisions.text.default.grey.default,
		marginBottom: 0,
	},
	group: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3v"),
	},
	standard: {
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: "18px",
		lineHeight: "28px",
		letterSpacing: 0,
		color: fr.colors.decisions.text.default.grey.default,
		marginBottom: 0,
	},
	groupBody: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3v"),
		paddingInline: fr.spacing("3w"),
		[fr.breakpoints.down("md")]: {
			paddingInline: 0,
		},
	},
	field: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1w"),
	},
	fieldLabel: {
		fontFamily: "Marianne",
		fontWeight: 700,
		fontSize: "16px",
		lineHeight: "24px",
		letterSpacing: 0,
		color: fr.colors.decisions.text.default.grey.default,
		marginBottom: 0,
	},
	tags: {
		display: "flex",
		flexWrap: "wrap",
		gap: fr.spacing("1w"),
	},
	tag: {
		"&&": {
			backgroundColor:
				fr.colors.decisions.background.actionLow.blueFrance.default,
			color: fr.colors.decisions.background.flat.blueFrance.default,
		},
	},
	prose: {
		fontFamily: "Marianne",
		fontSize: "16px",
		lineHeight: "24px",
		letterSpacing: 0,
		color: fr.colors.decisions.text.default.grey.default,

		"& p": {
			marginBottom: fr.spacing("3w"),
		},
		"& p:last-child, & ul:last-child": {
			marginBottom: 0,
		},
		"& ul": {
			marginBottom: fr.spacing("3w"),
		},
	},
});

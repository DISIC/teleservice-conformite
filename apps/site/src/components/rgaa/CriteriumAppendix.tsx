"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
import type { Appendix, Reference } from "@rgaa/content";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import { renderMarkdown } from "./helpers/markdown";
import { techniqueUrl, wcagSuccessCriterionUrl } from "./helpers/references";

interface CriteriumAppendixProps {
	appendix?: Appendix;
}

const isWcag = (standard: string) => standard.startsWith("WCAG");

const toEnClause = ({ reference, title, level }: Reference) =>
	`9.${reference} ${title}${level ? ` (${level})` : ""}`;

export default function CriteriumAppendix({
	appendix,
}: CriteriumAppendixProps) {
	const { classes } = useStyles();

	if (!appendix) return null;

	const { references = [], techniques = [], technicalNotes } = appendix;
	const wcagReferences = references.filter(({ standard }) => isWcag(standard));

	return (
		<div className={classes.root}>
			{(references.length > 0 || techniques.length > 0) && (
				<section className={classes.section}>
					<AppendixTitle icon="fr-icon-book-2-line" title="Références" />
					<StandardGroup title="WCAG 2.2">
						{wcagReferences.length > 0 && (
							<SuccessCriteriaField references={wcagReferences} />
						)}
						{techniques.length > 0 && (
							<TechniquesField techniques={techniques} />
						)}
					</StandardGroup>
					<StandardGroup title="EN 301 549 V2.1.2 (2018-08) (en anglais)">
						{wcagReferences.length > 0 && (
							<ul className={classes.clauses}>
								{wcagReferences.map((reference) => (
									<li key={reference.reference}>{toEnClause(reference)}</li>
								))}
							</ul>
						)}
					</StandardGroup>
				</section>
			)}

			{technicalNotes && (
				<section className={classes.section}>
					<AppendixTitle icon="fr-icon-draft-line" title="Notes techniques" />
					<div className={classes.prose}>{renderMarkdown(technicalNotes)}</div>
				</section>
			)}

			{appendix.particularCases && (
				<section className={classes.section}>
					<AppendixTitle icon="fr-icon-braces-line" title="Cas particuliers" />
					<div className={classes.prose}>
						{renderMarkdown(appendix.particularCases)}
					</div>
				</section>
			)}
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

function SuccessCriteriaField({ references }: { references: Reference[] }) {
	const { classes } = useStyles();

	return (
		<TagField label="Critère(s) de succès :">
			{references.map(({ reference, title, level }) => {
				const label = level ? `${reference} (${level})` : reference;
				return (
					<Tag
						key={reference}
						linkProps={externalLinkProps(
							wcagSuccessCriterionUrl(title),
							`${label} ${title}`,
						)}
						className={classes.tag}
					>
						{label}
					</Tag>
				);
			})}
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

const useStyles = tss.withName("CriteriumAppendix").create({
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
	clauses: {
		fontFamily: "Marianne",
		fontSize: "16px",
		lineHeight: "24px",
		letterSpacing: 0,
		color: fr.colors.decisions.text.default.grey.default,
		marginBottom: 0,
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

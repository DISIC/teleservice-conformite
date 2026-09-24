"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
import type { Appendix, Reference } from "@rgaa/content";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import { renderMarkdown } from "./helpers/markdown";

interface CriteriumAppendixProps {
	appendix?: Appendix;
}

// Techniques are WCAG techniques: they belong under the WCAG group, next to its success criteria.
const isWcag = (standard: string) => standard.startsWith("WCAG");

function groupByStandard(references: Reference[]) {
	const groups = new Map<string, Reference[]>();
	for (const reference of references) {
		const group = groups.get(reference.standard);
		if (group) group.push(reference);
		else groups.set(reference.standard, [reference]);
	}
	return [...groups];
}

export default function CriteriumAppendix({
	appendix,
}: CriteriumAppendixProps) {
	const { classes, cx } = useStyles();

	if (!appendix) return null;

	const { references = [], techniques = [], technicalNotes } = appendix;
	const groups = groupByStandard(references);
	const orphanTechniques =
		techniques.length > 0 && !groups.some(([standard]) => isWcag(standard));

	return (
		<div className={classes.root}>
			{(groups.length > 0 || techniques.length > 0) && (
				<section className={classes.section}>
					<AppendixTitle icon="fr-icon-book-2-line" title="Références" />
					{groups.map(([standard, group]) => (
						<div key={standard} className={classes.group}>
							<h6 className={cx(classes.standard, "fr-text--md")}>
								{standard}
							</h6>
							<div className={classes.groupBody}>
								<TagField label="Critère(s) de succès :">
									{group.map(({ reference, level }) => (
										// TODO: add link
										<Tag
											key={reference}
											linkProps={{
												href: "#",
											}}
											iconId="ri-external-link-fill"
											className={classes.tag}
										>
											{level ? `${reference} (${level})` : reference}
										</Tag>
									))}
								</TagField>
								{isWcag(standard) && techniques.length > 0 && (
									<TagField label="Technique(s) suffisante(s) et/ou échec(s) (en anglais) :">
										{techniques.map((technique) => (
											// TODO: add link
											<Tag
												key={technique}
												linkProps={{
													href: "#",
												}}
												iconId="ri-external-link-fill"
												className={classes.tag}
											>
												{technique}
											</Tag>
										))}
									</TagField>
								)}
							</div>
						</div>
					))}
					{orphanTechniques && (
						<div className={classes.groupBody}>
							<TagField label="Technique(s) suffisante(s) et/ou échec(s) (en anglais) :">
								{techniques.map((technique) => (
									// TODO: add link
									<Tag
										key={technique}
										linkProps={{
											href: "#",
										}}
										iconId="ri-external-link-fill"
										className={classes.tag}
									>
										{technique}
									</Tag>
								))}
							</TagField>
						</div>
					)}
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

function TagField({ label, children }: { label: string; children: ReactNode }) {
	const { classes } = useStyles();

	return (
		<div className={classes.field}>
			<p className={classes.fieldLabel}>{label}</p>
			<div className={classes.tags}>{children}</div>
		</div>
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
		// DSFR only ships fr-tag--icon-left; the design puts the icon after the label.
		"&&::before": {
			order: 1,
			marginLeft: "0.25rem",
			marginRight: "-0.125rem",
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

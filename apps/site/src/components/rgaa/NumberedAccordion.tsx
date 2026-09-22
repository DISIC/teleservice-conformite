"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import { renderMarkdownInline, toPlainText } from "./helpers/markdown";

type HeadingTag = `h${3 | 4 | 5 | 6}`;

type NumberedAccordionProps = {
	as: HeadingTag;
	// The accordion title sits under the heading above it, one level down.
	titleAs: HeadingTag;
	id?: string;
	number: string;
	label: string;
	accordionLabel: string;
	children: ReactNode;
	showLinkIcon?: boolean;
	headingClassName?: string;
	className?: string;
	defaultExpanded?: boolean;
	conditions?: string[];
	onExpandedChange?: (expanded: boolean) => void;
};

export default function NumberedAccordion({
	as: HtmlTag,
	titleAs,
	id,
	number,
	label,
	accordionLabel,
	children,
	showLinkIcon = false,
	headingClassName,
	className,
	defaultExpanded = false,
	conditions,
	onExpandedChange,
}: NumberedAccordionProps) {
	const { classes } = useNumberedAccordionStyles();
	const pathname = usePathname();

	return (
		<div id={id} className={classes.numberedAccordion}>
			<HtmlTag className={headingClassName}>
				<span>{number}. </span>
				<span>{renderMarkdownInline(label)}</span>
				{showLinkIcon && (
					<Button
						iconId="fr-icon-links-fill"
						title={`Lien vers ${number}. ${toPlainText(label)}`}
						priority="tertiary no outline"
						linkProps={{ href: `${pathname}#${number}` }}
						className={classes.link}
					/>
				)}
			</HtmlTag>
			<ul className={classes.conditions}>
				{conditions?.map((condition, index) => (
					<li key={index}>{renderMarkdownInline(condition)}</li>
				))}
			</ul>
			{children && (
				<Accordion
					titleAs={titleAs}
					label={accordionLabel}
					className={className}
					defaultExpanded={defaultExpanded}
					onExpandedChange={(value) => onExpandedChange?.(value)}
				>
					{children}
				</Accordion>
			)}
		</div>
	);
}

export const useNumberedAccordionStyles = tss
	.withName("NumberedAccordion")
	.create({
		link: {
			"&&": {
				color: fr.colors.decisions.text.mention.grey.default,
				backgroundColor: "transparent",
				"--hover-tint": "transparent",
				"--active-tint": "transparent",

				"&:hover, &:active": {
					color: fr.colors.decisions.text.title.grey.default,
				},
			},
		},
		numberedAccordion: {
			scrollMarginTop: fr.spacing("2w"),
			marginBottom: fr.spacing("4w"),
		},
		conditions: {
			fontSize: "16px",
			fontFamily: "Marianne",
			lineHeight: "24px",
			letterSpacing: 0,
			marginInline: fr.spacing("15v"),
			marginBottom: fr.spacing("5v"),
			marginTop: fr.spacing("2v"),
		},
	});

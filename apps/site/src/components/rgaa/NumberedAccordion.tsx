"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { tss } from "tss-react";

type NumberedAccordionProps = {
	as: "h4" | "p";
	id?: string;
	number: string;
	label: string;
	accordionLabel: string;
	children: ReactNode;
	showLinkIcon?: boolean;
	className?: string;
	defaultExpanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
};

export default function NumberedAccordion({
	as: HtmlTag,
	id,
	number,
	label,
	accordionLabel,
	children,
	showLinkIcon = false,
	className,
	defaultExpanded = false,
	onExpandedChange,
}: NumberedAccordionProps) {
	const { classes } = useNumberedAccordionStyles();
	const pathname = usePathname();

	return (
		<div id={id} className={classes.numberedAccordion}>
			<HtmlTag className={HtmlTag === "p" ? classes.heading : undefined}>
				<span>{number}. </span>
				<span>{label}</span>
				{showLinkIcon && (
					<Button
						iconId="fr-icon-links-fill"
						title={`Lien vers ${number}. ${label}`}
						priority="tertiary no outline"
						linkProps={{ href: `${pathname}#${number}` }}
						className={classes.link}
					/>
				)}
			</HtmlTag>
			{children && (
				<Accordion
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
		heading: {
			display: "flex",
			alignItems: "baseline",
			gap: fr.spacing("1v"),
			fontFamily: "Marianne",
			fontWeight: 700,
			fontSize: "18px",
			lineHeight: "28px",
			letterSpacing: 0,
		},
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
			marginBottom: fr.spacing("6w"),
		},
	});

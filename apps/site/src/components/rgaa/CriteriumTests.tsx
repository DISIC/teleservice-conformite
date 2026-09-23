"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { renderMarkdownInline } from "./helpers/markdown";
import type { Test } from "./helpers/topics";
import Button from "@codegouvfr/react-dsfr/Button";
import { usePathname } from "next/navigation";
import TestMethodology from "./TestMethodology";

type CriteriumTestsProps = {
	criteriumNumber: string;
	tests: Test[];
	defaultExpanded?: boolean;
	accordionBackgroundColor: string;
	onExpandedChange?: (expanded: boolean) => void;
};

export default function CriteriumTests({
	criteriumNumber,
	tests,
	defaultExpanded = false,
	accordionBackgroundColor,
	onExpandedChange,
}: CriteriumTestsProps) {
	const { classes, cx } = useStyles({ accordionBackgroundColor });
	const pathname = usePathname();

	return (
		<div data-accordion="test">
			<Accordion
				titleAs="h4"
				label={`Tests du critère ${criteriumNumber}`}
				className={classes.criteriaAccordion}
				defaultExpanded={defaultExpanded}
				onExpandedChange={(value) => onExpandedChange?.(value)}
			>
				{tests.map((test) => {
					const testNumber = `${criteriumNumber}.${test.number}`;

					return (
						<div key={`${test.label} ${testNumber}`} className={classes.test}>
							<h5 className={cx("fr-text--lg")}>
								<span className={classes.number}>{testNumber}</span>
								<span>{renderMarkdownInline(test.label)}</span>
								<Button
									iconId="fr-icon-links-fill"
									title={`Lien vers ${testNumber} ${test.label}`}
									priority="tertiary no outline"
									linkProps={{ href: `${pathname}#${testNumber}` }}
									className={classes.link}
								/>
							</h5>
							{test.methodology && (
								<TestMethodology
									testNumber={testNumber}
									methodology={test.methodology}
								/>
							)}
						</div>
					);
				})}
			</Accordion>
		</div>
	);
}

const useStyles = tss
	.withName(CriteriumTests.name)
	.withParams<{ accordionBackgroundColor: string }>()
	.create(({ accordionBackgroundColor }) => ({
		criteriaAccordion: {
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
		test: {
			marginBottom: fr.spacing("8v"),
		},
		methodologies: {
			backgroundColor: fr.colors.decisions.background.default.grey.default,
			fontFamily: "Marianne",
			fontSize: "16px",
			lineHeight: "24px",
			letterSpacing: "0%",
			fontWeight: 500,
			color: fr.colors.decisions.text.default.grey.default,

			"& p, & ol, & ul": {
				marginBottom: fr.spacing("1w"),
			},
			"& li > ul": {
				marginTop: fr.spacing("1v"),
				marginBottom: 0,
			},
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
		number: {
			marginRight: fr.spacing("3v"),
		},
	}));

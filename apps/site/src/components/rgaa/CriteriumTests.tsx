"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { renderMarkdownInline } from "./helpers/markdown";
import { useNumberedHeadingStyles } from "./helpers/styles";
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
	const { classes: headingClasses } = useNumberedHeadingStyles();
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
							<h5 className={cx("fr-text--lg", headingClasses.title)}>
								<span className={headingClasses.number}>{testNumber}</span>
								<span>
									{renderMarkdownInline(test.label)}
									<Button
										iconId="fr-icon-links-fill"
										title={`Lien vers ${testNumber} ${renderMarkdownInline(test.label)}`}
										priority="tertiary no outline"
										linkProps={{ href: `${pathname}#${testNumber}` }}
										className={headingClasses.link}
									/>
								</span>
							</h5>
							{test?.conditions && (
								<ul>
									{test?.conditions?.map((condition, index) => (
										<li key={index}>{renderMarkdownInline(condition)}</li>
									))}
								</ul>
							)}
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

			"& > h5": {
				marginBottom: 0,
			},

			"& > ul": {
				marginLeft: fr.spacing("13v"),

				[fr.breakpoints.down("md")]: {
					marginLeft: 0,
				},
			},
		},
	}));

"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import NumberedAccordion from "./NumberedAccordion";
import { setCollapsesExpanded } from "./helpers/collapse";
import type { Criterias } from "./helpers/topics";
import { getReferentielStyle, type ReferentielId } from "./referentiels";
import DisabledCriteriumAccordion from "./DisabledCriteriumAccordion";
import CriteriumAppendix from "./CriteriumAppendix";
import { renderMarkdown } from "./helpers/markdown";

type TopicCriteriaProps = {
	referentielId: ReferentielId;
	topic: Criterias["topics"][number];
};

export default function TopicCriteria({
	referentielId,
	topic,
}: TopicCriteriaProps) {
	const { testAccordionBackgroundColor } = getReferentielStyle(referentielId);
	const { classes } = useStyles({ testAccordionBackgroundColor });
	const [expandedCriteria, setExpandedCriteria] = useState<
		Record<string, boolean>
	>({});
	const criteriaRef = useRef<HTMLDivElement>(null);

	const expandableCriteria = topic.criteria.filter(
		({ criterium }) => criterium.tests.length > 0,
	);

	const allExpanded = expandableCriteria.every(
		({ criterium }) => expandedCriteria[criterium.number],
	);

	const toggleAll = () => {
		setExpandedCriteria(
			allExpanded
				? {}
				: Object.fromEntries(
						expandableCriteria.map(({ criterium }) => [criterium.number, true]),
					),
		);
		setCollapsesExpanded(
			criteriaRef.current?.querySelectorAll(
				":scope > div > .fr-accordion > .fr-collapse",
			) ?? [],
			!allExpanded,
		);
	};

	return (
		<>
			<Button
				className={classes.toggleButton}
				iconId="fr-icon-expand-up-down-fill"
				iconPosition="right"
				onClick={toggleAll}
				priority="secondary"
			>
				{allExpanded ? "Replier tous les tests" : "Déplier tous les tests"}
			</Button>
			<div ref={criteriaRef}>
				{topic.criteria.map(({ criterium }) => {
					const criteriumNumber = `${topic.number}.${criterium.number}`;

					if (!criterium.tests.length) {
						return (
							<DisabledCriteriumAccordion
								key={`${criterium.title} ${criterium.number}`}
								title={criterium.title}
								number={criteriumNumber}
							/>
						);
					}

					return (
						<NumberedAccordion
							key={`${criterium.title} ${criterium.number}`}
							as="h3"
							titleAs="h4"
							id={criteriumNumber}
							number={criteriumNumber}
							label={criterium.title}
							accordionLabel={`Tests et références du critère ${criteriumNumber}`}
							showLinkIcon={true}
							headingClassName={fr.cx("fr-h4")}
							className={classes.criteriaAccordion}
							defaultExpanded={expandedCriteria[criterium.number] ?? false}
							onExpandedChange={(expanded) =>
								setExpandedCriteria((value) => ({
									...value,
									[criterium.number]: expanded,
								}))
							}
						>
							{criterium.tests.map((test) => {
								const testNumber = `${criteriumNumber}.${test.number}`;

								return (
									<NumberedAccordion
										key={`${test.label} ${test.number}`}
										as="h5"
										titleAs="h6"
										id={testNumber}
										number={testNumber}
										showLinkIcon={true}
										conditions={test.conditions}
										label={test.label}
										accordionLabel={`Méthodologie du test ${testNumber}`}
										headingClassName={fr.cx("fr-text--lg")}
										className={classes.testAccordion}
									>
										<div className={classes.methodologies}>
											{renderMarkdown(test.methodology)}
										</div>
									</NumberedAccordion>
								);
							})}
							<CriteriumAppendix appendix={criterium.appendix} />
						</NumberedAccordion>
					);
				})}
			</div>
		</>
	);
}

const useStyles = tss
	.withName(TopicCriteria.name)
	.withParams<{ testAccordionBackgroundColor: string }>()
	.create(({ testAccordionBackgroundColor }) => ({
		criteriaAccordion: {
			marginLeft: fr.spacing("9v"),

			"& > .fr-accordion__title > .fr-accordion__btn": {
				fontFamily: "Marianne",
				fontWeight: 700,
				fontSize: "20px",
				lineHeight: "32px",
				letterSpacing: 0,
				backgroundColor: testAccordionBackgroundColor,
				color: fr.colors.decisions.text.title.grey.default,

				"--hover-tint": testAccordionBackgroundColor,
				"--active-tint": testAccordionBackgroundColor,
			},

			"& > .fr-collapse": {
				margin: 0,
				backgroundColor: fr.colors.decisions.background.alt.grey.default,
			},
		},
		testAccordion: {
			marginLeft: fr.spacing("5w"),

			"& > .fr-accordion__title > .fr-accordion__btn": {
				fontFamily: "Marianne",
				fontWeight: 700,
				fontSize: "18px",
				lineHeight: "28px",
				letterSpacing: 0,
				backgroundColor: fr.colors.decisions.background.default.grey.default,
				color: fr.colors.decisions.text.title.grey.default,

				"--hover-tint": fr.colors.decisions.background.default.grey.default,
				"--active-tint": fr.colors.decisions.background.default.grey.default,
			},

			"& > .fr-collapse": {
				margin: 0,
				backgroundColor: fr.colors.decisions.background.default.grey.default,
			},
		},
		toggleButton: {
			display: "flex",
			marginLeft: "auto",
			marginBottom: fr.spacing("3w"),
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
	}));

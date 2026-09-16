"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { useRef, useState } from "react";
import { tss } from "tss-react";
import NumberedAccordion from "./NumberedAccordion";
import { setCollapsesExpanded } from "./helpers/collapse";
import { colors } from "./helpers/colors";
import type { Criterias } from "./helpers/topics";
import type { ReferenceId } from "./references";

type TopicCriteriaProps = {
	reference: ReferenceId;
	topic: Criterias["topics"][number];
};

export default function TopicCriteria({
	reference,
	topic,
}: TopicCriteriaProps) {
	const { classes } = useStyles(colors[reference]);
	const [expandedCriteria, setExpandedCriteria] = useState<
		Record<string, boolean>
	>({});
	const criteriaRef = useRef<HTMLDivElement>(null);

	const allExpanded = topic.criteria.every(
		({ criterium }) => expandedCriteria[criterium.number],
	);

	const toggleAll = () => {
		setExpandedCriteria(
			allExpanded
				? {}
				: Object.fromEntries(
						topic.criteria.map(({ criterium }) => [criterium.number, true]),
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
				iconId={allExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}
				iconPosition="right"
				onClick={toggleAll}
				priority="secondary"
			>
				{allExpanded
					? "Replier tous les critères"
					: "Déplier tous les critères"}
			</Button>
			<div ref={criteriaRef}>
				{topic.criteria.map(({ criterium }) => {
					const criteriumNumber = `${topic.number}.${criterium.number}`;

					return (
						<NumberedAccordion
							key={criterium.number}
							as="h4"
							id={criteriumNumber}
							number={criteriumNumber}
							label={criterium.title}
							accordionLabel={`Tests et références du critère ${criteriumNumber}`}
							showLinkIcon={true}
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
										key={test.number}
										as="p"
										number={testNumber}
										label={test.label}
										accordionLabel={`Méthodologie du test ${testNumber}`}
										className={classes.testAccordion}
									>
										{test?.methodologies?.length && (
											<div className={classes.methodologies}>
												{test.methodologies?.map((methodology) => (
													<p key={methodology}>{methodology}</p>
												))}
											</div>
										)}
									</NumberedAccordion>
								);
							})}
						</NumberedAccordion>
					);
				})}
			</div>
		</>
	);
}

const useStyles = tss
	.withName(TopicCriteria.name)
	.withParams<{ criteriaAccordionBackgroundColor: string }>()
	.create(({ criteriaAccordionBackgroundColor }) => ({
		criteriaAccordion: {
			"& > .fr-accordion__title > .fr-accordion__btn": {
				fontFamily: "Marianne",
				fontWeight: 700,
				fontSize: "20px",
				lineHeight: "32px",
				letterSpacing: 0,
				backgroundColor: criteriaAccordionBackgroundColor,
				color: fr.colors.decisions.text.title.grey.default,

				"--hover-tint": criteriaAccordionBackgroundColor,
				"--active-tint": criteriaAccordionBackgroundColor,
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

			"& p": {
				marginBottom: fr.spacing("1w"),
			},
		},
	}));

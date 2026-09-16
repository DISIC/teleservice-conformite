"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { useRef, useState, type ReactNode } from "react";
import { tss } from "tss-react";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import { setCollapsesExpanded } from "./helpers/collapse";
import { DEFAULT_TOPICS, type Criterias } from "./helpers/topics";
import type { ReferenceId } from "./references";
import { usePathname } from "next/navigation";

interface AccordionListProps {
	reference: ReferenceId;
	criterias: Criterias;
	expandedTopics: Record<string, boolean>;
	onTopicExpandedChange: (topic: string, expanded: boolean) => void;
}

const colors = {
	web: {
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.actionLow.pinkMacaron.default,
		criteriaAccordionBackgroundColor:
			fr.colors.decisions.background.contrast.pinkMacaron.default,
	},
	mobile: {
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.actionLow.yellowTournesol.default,
		criteriaAccordionBackgroundColor:
			fr.colors.decisions.background.contrast.yellowTournesol.default,
	},
	bureautique: {
		topicAccordionBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
		criteriaAccordionBackgroundColor:
			fr.colors.decisions.background.alt.greenEmeraude.default,
	},
};

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

function NumberedAccordion({
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

type TopicCriteriaProps = {
	reference: ReferenceId;
	topic: Criterias["topics"][number];
};

function TopicCriteria({ reference, topic }: TopicCriteriaProps) {
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

export default function AccordionList({
	reference,
	criterias,
	expandedTopics,
	onTopicExpandedChange,
}: AccordionListProps) {
	const { classes } = useStyles(colors[reference]);
	const { classes: linkClasses } = useNumberedAccordionStyles();
	const pathname = usePathname();

	// Not an fr-accordions-group: that DSFR group only lets one accordion stay open.
	return (
		<div className={classes.list}>
			{DEFAULT_TOPICS.map((topic, index) => {
				const applicationTopic = criterias.topics.find(
					(t) => t.topic === topic,
				);

				if (!applicationTopic)
					return (
						<DisabledTopicAccordion
							key={topic}
							topicIndex={index + 1}
							topicName={topic}
							referenceName={criterias.reference}
						/>
					);

				return (
					<div
						key={applicationTopic.topic}
						id={`${index + 1}`}
						data-topic-accordion
						className={classes.topicAnchor}
					>
						<Accordion
							titleAs="h2"
							defaultExpanded={expandedTopics[applicationTopic.topic] ?? false}
							onExpandedChange={(expanded) =>
								onTopicExpandedChange(applicationTopic.topic, expanded)
							}
							label={
								<>
									{`${index + 1}. ${topic}`}
									<Button
										iconId="fr-icon-links-fill"
										title={`Lien vers ${index + 1}. ${topic}`}
										priority="tertiary no outline"
										linkProps={{ href: `${pathname}#${index + 1}` }}
										className={linkClasses.link}
									/>
								</>
							}
							className={classes.topicAccordion}
						>
							<TopicCriteria reference={reference} topic={applicationTopic} />
						</Accordion>
					</div>
				);
			})}
		</div>
	);
}

const useStyles = tss
	.withName(AccordionList.name)
	.withParams<{
		topicAccordionBackgroundColor: string;
		criteriaAccordionBackgroundColor: string;
	}>()
	.create(
		({ topicAccordionBackgroundColor, criteriaAccordionBackgroundColor }) => ({
			list: {
				display: "flex",
				flexDirection: "column",
				gap: fr.spacing("5w"),
			},
			topicAnchor: {
				scrollMarginTop: fr.spacing("2w"),
			},
			topicAccordion: {
				color: fr.colors.decisions.text.title.grey.default,
				borderLeft: `4px solid ${topicAccordionBackgroundColor}`,

				"&&::before": {
					boxShadow: "none",
				},

				"& > .fr-collapse": {
					borderBottom: "0px",
					paddingLeft: fr.spacing("3w"),
				},

				"& > .fr-accordion__title > .fr-accordion__btn": {
					fontFamily: "Marianne",
					fontWeight: 700,
					fontSize: "32px",
					lineHeight: "40px",
					letterSpacing: 0,
					backgroundColor: topicAccordionBackgroundColor,
					color: fr.colors.decisions.text.title.grey.default,
					borderBottom: "0px",

					"--hover-tint": topicAccordionBackgroundColor,
					"--active-tint": topicAccordionBackgroundColor,
				},
			},
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
		}),
	);

const useNumberedAccordionStyles = tss.withName("NumberedAccordion").create({
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

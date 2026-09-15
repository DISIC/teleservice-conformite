"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import { DEFAULT_TOPICS, type Criterias } from "./helpers/topics";
import type { ReferenceId } from "./references";
import { usePathname } from "next/navigation";

interface AccordionListProps {
	reference: ReferenceId;
	criterias: Criterias;
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
	number: string;
	label: string;
	accordionLabel: string;
	children: ReactNode;
	showLinkIcon?: boolean;
	className?: string;
	defaultExpanded?: boolean;
};

function NumberedAccordion({
	as: HtmlTag,
	number,
	label,
	accordionLabel,
	children,
	showLinkIcon = false,
	className,
	defaultExpanded = false,
}: NumberedAccordionProps) {
	const { classes } = useNumberedAccordionStyles();
	const pathname = usePathname();

	return (
		<div className={classes.numberedAccordion}>
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
				>
					{children}
				</Accordion>
			)}
		</div>
	);
}

export default function AccordionList({
	reference,
	criterias,
}: AccordionListProps) {
	const { classes, cx } = useStyles(colors[reference]);
	const { classes: linkClasses } = useNumberedAccordionStyles();
	const pathname = usePathname();
	// const [expanded, setExpanded] = useState(true);

	return (
		<div className={cx(fr.cx("fr-accordions-group"), classes.list)}>
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
					<Accordion
						key={applicationTopic.topic}
						titleAs="h2"
						defaultExpanded
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
						{applicationTopic.criteria.map(({ criterium }) => {
							const criteriumNumber = `${applicationTopic.number}.${criterium.number}`;

							return (
								<NumberedAccordion
									key={criterium.number}
									as="h4"
									number={criteriumNumber}
									label={criterium.title}
									accordionLabel={`Tests et références du critère ${criteriumNumber}`}
									showLinkIcon={true}
									className={classes.criteriaAccordion}
									defaultExpanded
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
					</Accordion>
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
				alignSelf: "flex-end",
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
		marginBottom: fr.spacing("6w"),
	},
});

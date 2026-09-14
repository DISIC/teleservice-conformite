import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import DisabledTopicAccordion from "./DisabledTopicAccordion";
import { DEFAULT_TOPICS, type Criterias } from "./helpers/topics";

interface AccordionListProps {
	reference: "web" | "mobile" | "bureautique";
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
	children: NonNullable<ReactNode>;
};

function NumberedAccordion({
	as: Tag,
	number,
	label,
	accordionLabel,
	children,
}: NumberedAccordionProps) {
	return (
		<div>
			<Tag>{`${number}. ${label}`}</Tag>
			<Accordion label={accordionLabel}>{children}</Accordion>
		</div>
	);
}

export default function AccordionList({
	reference,
	criterias,
}: AccordionListProps) {
	const { classes, cx } = useStyles(colors[reference]);

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
						label={`${index + 1}. ${topic}`}
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
											>
												<p>{test.label}</p>
												{test.conditions?.map((condition) => (
													<p key={condition}>{condition}</p>
												))}
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
	.create(({ topicAccordionBackgroundColor }) => ({
		list: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("5w"),
		},
		topicAccordion: {
			color: fr.colors.decisions.text.title.grey.default,
			borderLeft: `4px solid ${topicAccordionBackgroundColor}`,

			"& div": {
				borderBottom: "0px",
			},

			"& button": {
				backgroundColor: topicAccordionBackgroundColor,
				borderBottom: "0px",

				"--hover": topicAccordionBackgroundColor,
				"--active": topicAccordionBackgroundColor,
			},

			"& > h2": {
				fontFamily: "Marianne",
				fontWeight: 700,
				fontSize: "32px",
				lineHeight: "40px",
				letterSpacing: "0%",
				color: fr.colors.decisions.text.title.grey.default,
			},
		},
	}));

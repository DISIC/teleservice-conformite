"use client";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";
import { useEffect, useRef, useState } from "react";
import { tss } from "tss-react";
import { renderMarkdownInline, toPlainText } from "./helpers/markdown";
import {
	belowStickyTopicHeading,
	useNumberedHeadingStyles,
} from "./helpers/styles";
import type { Test } from "./helpers/topics";
import AnchorLinkButton from "./AnchorLinkButton";
import TestMethodology from "./TestMethodology";
import { discloseWhenReady } from "./helpers/collapse";

const TEST_COLLAPSE = ":scope > .fr-accordion > .fr-collapse";

type CriteriumTestsProps = {
	criteriumNumber: string;
	tests: Test[];
	accordionBackgroundColor: string;
};

export default function CriteriumTests({
	criteriumNumber,
	tests,
	accordionBackgroundColor,
}: CriteriumTestsProps) {
	const { classes, cx } = useStyles({ accordionBackgroundColor });
	const { classes: headingClasses } = useNumberedHeadingStyles();
	const [expanded, setExpanded] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (!wrapper) return;

		const onDisclose = () => setExpanded(true);
		const onConceal = () => setExpanded(false);

		wrapper.addEventListener("dsfr.disclose", onDisclose);
		wrapper.addEventListener("dsfr.conceal", onConceal);

		return () => {
			wrapper.removeEventListener("dsfr.disclose", onDisclose);
			wrapper.removeEventListener("dsfr.conceal", onConceal);
		};
	}, []);

	// A link to one test unfolds its criterium's tests, leaving the others folded.
	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (!wrapper) return;

		let reveal: AbortController | undefined;

		const revealTarget = () => {
			const target = document.getElementById(
				decodeURIComponent(window.location.hash.slice(1)),
			);
			const collapse = wrapper.querySelector(TEST_COLLAPSE);

			if (!target || !collapse?.contains(target)) return;

			reveal?.abort();
			reveal = new AbortController();
			const { signal } = reveal;
			const scroll = () => target.scrollIntoView({ block: "start" });

			signal.addEventListener("abort", discloseWhenReady(collapse));
			wrapper.addEventListener("dsfr.disclose", scroll, { once: true, signal });
			// The page is still settling while the accordion unfolds: land again once it is open.
			collapse.addEventListener(
				"transitionend",
				(event) => {
					if (event.target !== collapse) return;
					scroll();
					reveal?.abort();
				},
				{ signal },
			);
			wrapper.addEventListener("dsfr.conceal", () => reveal?.abort(), {
				signal,
			});
		};

		revealTarget();
		window.addEventListener("hashchange", revealTarget);
		return () => {
			window.removeEventListener("hashchange", revealTarget);
			reveal?.abort();
		};
	}, []);

	return (
		<div data-accordion="test" ref={wrapperRef}>
			<Accordion
				titleAs="h4"
				label={`Tests du critère ${criteriumNumber}`}
				className={classes.criteriaAccordion}
				expanded={expanded}
				onExpandedChange={setExpanded}
			>
				{tests.map((test) => {
					const testNumber = `${criteriumNumber}.${test.number}`;

					return (
						<div
							key={`${test.label} ${testNumber}`}
							id={testNumber}
							className={classes.test}
						>
							<h5 className={cx("fr-text--lg", headingClasses.title)}>
								<span className={headingClasses.number}>
									{testNumber}&nbsp;
								</span>
								<span>
									{renderMarkdownInline(test.label)}
									<AnchorLinkButton
										targetId={testNumber}
										title={`Lien vers ${testNumber} ${toPlainText(test.label)}`}
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
			scrollMarginTop: belowStickyTopicHeading,
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

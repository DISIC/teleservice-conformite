import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { A11Y_ALLOWLIST } from "./a11yAllowlist";

/** RGAA 4.1.2 rests on WCAG 2.1 AA: axe's A and AA tags for 2.0 and 2.1, no opinionated best practices. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

type Violation = Awaited<
	ReturnType<AxeBuilder["analyze"]>
>["violations"][number];

const isAllowed = (violation: Violation, target: string) =>
	A11Y_ALLOWLIST.some(
		(entry) =>
			entry.rule === violation.id &&
			(entry.target === undefined || target.includes(entry.target)),
	);

/** DSFR fades modals in; contrast measured mid-transition reads the half-opaque text as failing. */
const settleAnimations = (page: Page) =>
	page.evaluate(() =>
		Promise.race([
			Promise.all(
				document
					.getAnimations()
					.map((animation) => animation.finished.catch(() => {})),
			),
			new Promise((resolve) => setTimeout(resolve, 2000)),
		]),
	);

/** Soft assertion: the flow goes on and every checkpoint of the run reports at once. */
export async function expectAccessible(
	page: Page,
	testInfo: TestInfo,
	checkpoint: string,
) {
	await settleAnimations(page);
	const { violations } = await new AxeBuilder({ page })
		.withTags(TAGS)
		.analyze();
	await testInfo.attach(`axe: ${checkpoint}`, {
		body: JSON.stringify(violations, null, 2),
		contentType: "application/json",
	});
	const report = violations
		.map((violation) => ({
			...violation,
			nodes: violation.nodes.filter(
				(node) => !isAllowed(violation, node.target.join(" ")),
			),
		}))
		.filter((violation) => violation.nodes.length > 0)
		.map(
			(violation) =>
				`${violation.id} (${violation.impact}): ${violation.help} — ${violation.helpUrl}\n` +
				violation.nodes.map((node) => `  ${node.target.join(" ")}`).join("\n"),
		)
		.join("\n");
	expect.soft(report, `axe violations at "${checkpoint}"`).toBe("");
}

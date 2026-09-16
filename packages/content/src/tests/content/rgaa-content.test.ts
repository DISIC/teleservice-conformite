import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkContent } from "~/index";
import { formatProblem } from "~/problems";

const CONTENT_DIR = path.join(
	import.meta.dirname,
	"../../../../../rgaa/content",
);

describe("rgaa/content", () => {
	it("passes the checks", () => {
		const result = checkContent(CONTENT_DIR);
		if (!result.ok) {
			throw new Error(
				result.problems.map((p) => formatProblem(p, "rgaa/content")).join("\n"),
			);
		}
		const images = result.model.topics.find((t) => t.number === "1");
		expect(images?.title).toBe("Images");
		expect(images?.criteria.map((c) => c.number)).toEqual([
			"1.1",
			"1.2",
			"1.3",
			"1.4",
			"1.5",
			"1.6",
			"1.7",
			"1.8",
			"1.9",
		]);
		const tests =
			images?.criteria.flatMap((c) => c.referentiels.web?.tests ?? []) ?? [];
		expect(tests).toHaveLength(59);
		expect(result.model.terms.length).toBeGreaterThanOrEqual(20);
	});
});

import { describe, expect, it } from "vitest";
import { isHttpUrl, optionalUrlIssue, todayIsoDate } from "~/forms/rules";

describe("isHttpUrl", () => {
	it.each(["https://www.example.fr", "http://intranet.example.fr/contact"])(
		"accepts %s",
		(value) => expect(isHttpUrl(value)).toBe(true),
	);

	it.each([
		"javascript:alert(1)",
		"javascript://example.fr/%0aalert(1)",
		"JavaScript:alert(1)",
		"data:text/html,<script>alert(1)</script>",
		"ftp://example.fr",
		"www.example.fr",
		"",
		null,
		undefined,
	])("rejects %s", (value) => expect(isHttpUrl(value)).toBe(false));
});

describe("optionalUrlIssue", () => {
	const issuesFor = (value: string) => {
		const issues: unknown[] = [];
		optionalUrlIssue(
			{ addIssue: (issue) => issues.push(issue) },
			["url"],
			value,
		);
		return issues;
	};

	it("flags a javascript: URL", () => {
		expect(issuesFor("javascript:alert(1)")).toHaveLength(1);
	});

	it("leaves an empty value to the required rules", () => {
		expect(issuesFor("")).toHaveLength(0);
	});
});

describe("todayIsoDate", () => {
	it("reads the date in Paris, whatever the runtime timezone", () => {
		// 23:30 UTC on 12 October is already 13 October in Paris (UTC+2).
		expect(todayIsoDate(new Date("2026-10-12T23:30:00Z"))).toBe("2026-10-13");
		expect(todayIsoDate(new Date("2026-10-12T12:00:00Z"))).toBe("2026-10-12");
	});
});

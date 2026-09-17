import { describe, expect, it } from "vitest";
import {
	getObsolescence,
	obsolescenceOf,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";
import {
	completeDeclaration,
	publishedDeclaration,
} from "./declaration.fixture";

const PUBLISHED = new Date("2023-03-24T10:30:00.000Z");

describe("obsoleteSince", () => {
	it("is three years after the last publication", () => {
		expect(obsoleteSince(PUBLISHED).toISOString().slice(0, 10)).toBe(
			"2026-03-24",
		);
	});

	it("rolls a 29 February over to 1 March", () => {
		expect(
			obsoleteSince(new Date("2024-02-29T00:00:00.000Z"))
				.toISOString()
				.slice(0, 10),
		).toBe("2027-03-01");
	});
});

describe("obsolescenceOf", () => {
	it("is valid until three months before the deadline", () => {
		expect(obsolescenceOf(PUBLISHED, new Date("2024-01-01T00:00:00Z"))).toBe(
			"valid",
		);
		expect(obsolescenceOf(PUBLISHED, new Date("2025-12-23T23:59:59Z"))).toBe(
			"valid",
		);
	});

	it("is expiring from three months before the deadline, on the calendar day", () => {
		expect(obsolescenceOf(PUBLISHED, new Date("2025-12-24T00:00:00Z"))).toBe(
			"expiring",
		);
		expect(obsolescenceOf(PUBLISHED, new Date("2026-03-24T23:59:59Z"))).toBe(
			"expiring",
		);
	});

	it("is obsolete the day after the deadline, whatever the publish hour", () => {
		expect(obsolescenceOf(PUBLISHED, new Date("2026-03-25T00:00:00Z"))).toBe(
			"obsolete",
		);
		expect(obsolescenceOf(PUBLISHED, new Date("2030-01-01T00:00:00Z"))).toBe(
			"obsolete",
		);
	});
});

describe("getObsolescence", () => {
	const FAR_FUTURE = new Date("2099-01-01T00:00:00Z");

	it("is valid for a Brouillon, however old", () => {
		expect(getObsolescence(completeDeclaration(), FAR_FUTURE)).toBe("valid");
	});

	it("is valid for a Publiée row without a publish date", () => {
		expect(
			getObsolescence(
				{ ...publishedDeclaration(), published_at: null },
				FAR_FUTURE,
			),
		).toBe("valid");
	});

	it("reads the last publish date of a Publiée row", () => {
		const declaration = {
			...publishedDeclaration(),
			published_at: PUBLISHED.toISOString(),
		};
		expect(getObsolescence(declaration, new Date("2025-01-01T00:00:00Z"))).toBe(
			"valid",
		);
		expect(getObsolescence(declaration, new Date("2026-01-01T00:00:00Z"))).toBe(
			"expiring",
		);
		expect(getObsolescence(declaration, FAR_FUTURE)).toBe("obsolete");
	});

	it("ignores whether the row is Modifiée", () => {
		const modified = {
			...publishedDeclaration(),
			published_at: PUBLISHED.toISOString(),
			status: "unpublished" as const,
		};
		expect(getObsolescence(modified, FAR_FUTURE)).toBe("obsolete");
	});
});

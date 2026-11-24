import { describe, expect, it } from "vitest";
import {
	getObsolescence,
	obsolescenceOf,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";
import {
	completeDeclaration,
	depositedDeclaration,
} from "./declaration.fixture";

const DEPOSITED = new Date("2023-03-24T10:30:00.000Z");

describe("obsoleteSince", () => {
	it("is three years after the last deposit", () => {
		expect(obsoleteSince(DEPOSITED).toISOString().slice(0, 10)).toBe(
			"2026-03-24",
		);
	});

	it("clamps a 29 February to the last day of February", () => {
		expect(
			obsoleteSince(new Date("2024-02-29T00:00:00.000Z"))
				.toISOString()
				.slice(0, 10),
		).toBe("2027-02-28");
	});
});

describe("obsolescenceOf", () => {
	it("is valid until three months before the deadline", () => {
		expect(obsolescenceOf(DEPOSITED, new Date("2024-01-01T00:00:00Z"))).toBe(
			"valid",
		);
		expect(obsolescenceOf(DEPOSITED, new Date("2025-12-23T23:59:59Z"))).toBe(
			"valid",
		);
	});

	it("is expiring from three months before the deadline, on the calendar day", () => {
		expect(obsolescenceOf(DEPOSITED, new Date("2025-12-24T00:00:00Z"))).toBe(
			"expiring",
		);
		expect(obsolescenceOf(DEPOSITED, new Date("2026-03-24T23:59:59Z"))).toBe(
			"expiring",
		);
	});

	it("opens the warning window on the last day of a short month", () => {
		const deposited = new Date("2023-05-31T12:00:00Z");
		expect(obsolescenceOf(deposited, new Date("2026-02-27T00:00:00Z"))).toBe(
			"valid",
		);
		expect(obsolescenceOf(deposited, new Date("2026-02-28T00:00:00Z"))).toBe(
			"expiring",
		);
		expect(obsolescenceOf(deposited, new Date("2026-05-31T23:59:59Z"))).toBe(
			"expiring",
		);
		expect(obsolescenceOf(deposited, new Date("2026-06-01T00:00:00Z"))).toBe(
			"obsolete",
		);
	});

	it("is obsolete the day after the deadline, whatever the deposit hour", () => {
		expect(obsolescenceOf(DEPOSITED, new Date("2026-03-25T00:00:00Z"))).toBe(
			"obsolete",
		);
		expect(obsolescenceOf(DEPOSITED, new Date("2030-01-01T00:00:00Z"))).toBe(
			"obsolete",
		);
	});
});

describe("getObsolescence", () => {
	const FAR_FUTURE = new Date("2099-01-01T00:00:00Z");

	it("is valid for a Brouillon, however old", () => {
		expect(getObsolescence(completeDeclaration(), FAR_FUTURE)).toBe("valid");
	});

	it("is valid for a Déposée row without a deposit date", () => {
		expect(
			getObsolescence(
				{ ...depositedDeclaration(), deposited_at: null },
				FAR_FUTURE,
			),
		).toBe("valid");
	});

	it("reads the last deposit date of a Déposée row", () => {
		const declaration = {
			...depositedDeclaration(),
			deposited_at: DEPOSITED.toISOString(),
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
			...depositedDeclaration(),
			deposited_at: DEPOSITED.toISOString(),
			status: "undeposited" as const,
		};
		expect(getObsolescence(modified, FAR_FUTURE)).toBe("obsolete");
	});
});

import { describe, expect, it } from "vitest";
import {
	formatRate,
	getConformityStatus,
	hasBlockingElements,
} from "~/domain/declaration/conformity";

describe("getConformityStatus", () => {
	it("is non conforme below 50 %", () => {
		expect(getConformityStatus(49)).toEqual({
			label: "Non conforme",
			severity: "error",
		});
	});

	it("is partiellement conforme from 50 to 99 %, shown as info", () => {
		expect(getConformityStatus(50).severity).toBe("info");
		expect(getConformityStatus(99)).toEqual({
			label: "Partiellement conforme",
			severity: "info",
		});
	});

	it("is non conforme with blocking elements, whatever the rate", () => {
		expect(getConformityStatus(100, { hasBlockingElements: true })).toEqual({
			label: "Non conforme",
			severity: "error",
		});
	});

	it("is conforme at 100 %", () => {
		expect(getConformityStatus(100)).toEqual({
			label: "Conforme",
			severity: "success",
		});
	});
});

describe("hasBlockingElements", () => {
	const audit = {
		rgaa_version: "rgaa_5",
		hasBlockingElements: true,
		blockingElements: "Navigation au clavier impossible",
	};

	it("counts described blocking elements of an RGAA 5 audit", () => {
		expect(hasBlockingElements(audit)).toBe(true);
	});

	it("ignores them on RGAA 4, when not reported, or not yet described", () => {
		expect(hasBlockingElements({ ...audit, rgaa_version: "rgaa_4" })).toBe(
			false,
		);
		expect(hasBlockingElements({ ...audit, hasBlockingElements: false })).toBe(
			false,
		);
		expect(hasBlockingElements({ ...audit, blockingElements: "  " })).toBe(
			false,
		);
		expect(hasBlockingElements(null)).toBe(false);
	});
});

describe("formatRate", () => {
	it("uses a decimal comma and a space before the percent sign", () => {
		expect(formatRate(12.5)).toBe("12,5 %");
		expect(formatRate(100)).toBe("100 %");
	});
});

import { describe, expect, it } from "vitest";
import {
	formatRate,
	getConformityStatus,
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

	it("is conforme at 100 %", () => {
		expect(getConformityStatus(100)).toEqual({
			label: "Conforme",
			severity: "success",
		});
	});
});

describe("formatRate", () => {
	it("uses a decimal comma and a space before the percent sign", () => {
		expect(formatRate(12.5)).toBe("12,5 %");
		expect(formatRate(100)).toBe("100 %");
	});
});

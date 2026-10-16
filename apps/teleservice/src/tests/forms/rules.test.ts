import { describe, expect, it } from "vitest";
import { todayIsoDate } from "~/forms/rules";

describe("todayIsoDate", () => {
	it("reads the date in Paris, whatever the runtime timezone", () => {
		// 23:30 UTC on 12 October is already 13 October in Paris (UTC+2).
		expect(todayIsoDate(new Date("2026-10-12T23:30:00Z"))).toBe("2026-10-13");
		expect(todayIsoDate(new Date("2026-10-12T12:00:00Z"))).toBe("2026-10-12");
	});
});

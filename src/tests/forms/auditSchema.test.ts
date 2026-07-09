import { describe, expect, it } from "vitest";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	auditContents,
	auditGeneral,
	auditGeneralDefaultValues,
	auditToGeneralValues,
	auditTools,
	auditToToolsValues,
} from "~/forms/audit/auditSchema";

type Audit = PopulatedDeclaration["audit"];

describe("auditGeneral", () => {
	it("requires answering the realisation question", () => {
		const result = auditGeneral.safeParse({
			isAuditRealised: undefined,
			date: "",
			realisedBy: "",
			rgaa_version: "rgaa_4",
			rate: 0,
		});
		expect(result.error?.issues[0]?.path).toEqual(["isAuditRealised"]);
	});

	it("passes a non-realised audit without further fields", () => {
		expect(
			auditGeneral.safeParse({
				isAuditRealised: false,
				date: "",
				realisedBy: "",
				rgaa_version: "rgaa_4",
				rate: 0,
			}).success,
		).toBe(true);
	});

	it("a realised audit requires the auditor and a 0-100 rate", () => {
		const result = auditGeneral.safeParse({
			isAuditRealised: true,
			date: "",
			realisedBy: "",
			rgaa_version: "rgaa_4",
			rate: 150,
		});
		expect(result.error?.issues.map((i) => i.path)).toEqual([
			["realisedBy"],
			["rate"],
		]);
	});

	it("a realised audit rejects an unfilled (null) rate", () => {
		const result = auditGeneral.safeParse({
			isAuditRealised: true,
			date: "",
			realisedBy: "DINUM",
			rgaa_version: "rgaa_4",
			rate: null,
		});
		expect(result.error?.issues.map((i) => i.path)).toEqual([["rate"]]);
	});

	it("accepts a null rate while the audit is not realised", () => {
		expect(
			auditGeneral.safeParse({
				isAuditRealised: false,
				date: "",
				realisedBy: "",
				rgaa_version: "rgaa_4",
				rate: null,
			}).success,
		).toBe(true);
	});
});

describe("auditContents", () => {
	it("requires the compliant elements text", () => {
		expect(auditContents.safeParse({ compliantElements: "" }).success).toBe(
			false,
		);
		expect(
			auditContents.safeParse({ compliantElements: "Textes" }).success,
		).toBe(true);
	});
});

describe("auditTools", () => {
	it("is all-optional", () => {
		expect(auditTools.safeParse({}).success).toBe(true);
	});
});

describe("auditToGeneralValues", () => {
	it("falls back to defaults when the audit group is absent", () => {
		expect(auditToGeneralValues(null as unknown as Audit)).toEqual(
			auditGeneralDefaultValues,
		);
	});

	it("formats the persisted date for the date input", () => {
		const values = auditToGeneralValues({
			isRealised: true,
			date: "2026-06-01T12:00:00.000Z",
			realisedBy: "DINUM",
			rgaa_version: "rgaa_5",
			rate: 80,
		} as Audit);
		expect(values.date).toBe("2026-06-01");
		expect(values.rgaa_version).toBe("rgaa_5");
	});

	it("falls back to rgaa_4 for an unknown persisted version", () => {
		expect(
			auditToGeneralValues({ rgaa_version: "rgaa_99" } as unknown as Audit)
				.rgaa_version,
		).toBe("rgaa_4");
	});
});

describe("auditToToolsValues", () => {
	it("maps persisted {name} rows to select values", () => {
		expect(
			auditToToolsValues({
				usedTools: [{ name: "wave" }, { name: "nvda" }],
				testEnvironments: [{ name: "voiceover_safari" }],
			} as unknown as Audit),
		).toEqual({
			usedTools: ["wave", "nvda"],
			testEnvironments: ["voiceover_safari"],
		});
	});
});

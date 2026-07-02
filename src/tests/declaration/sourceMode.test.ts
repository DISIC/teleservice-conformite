import { describe, expect, it } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import {
	deriveSourceMode,
	isSourceModeUndecided,
} from "~/utils/declaration/sourceMode";

describe("deriveSourceMode", () => {
	it("is linked when parent is an unpopulated id", () => {
		const d = completeDeclaration({ contact: { parent: 3 } } as never);
		expect(deriveSourceMode("contact", d)).toBe("linked");
	});

	it("is linked when parent is a populated object", () => {
		const d = completeDeclaration({ schema: { parent: { id: 3 } } } as never);
		expect(deriveSourceMode("schema", d)).toBe("linked");
	});

	it("linked wins over the skipped flag", () => {
		const d = completeDeclaration({
			schema: { parent: 3, skipped: true },
		} as never);
		expect(deriveSourceMode("schema", d)).toBe("linked");
	});

	it("is skipped for a schema deliberately skipped", () => {
		const d = completeDeclaration({ schema: { skipped: true } } as never);
		expect(deriveSourceMode("schema", d)).toBe("skipped");
	});

	it("is custom as soon as any content field holds a value", () => {
		expect(
			deriveSourceMode(
				"contact",
				completeDeclaration({ contact: { email: "a@b.fr" } } as never),
			),
		).toBe("custom");
		expect(
			deriveSourceMode(
				"schema",
				completeDeclaration({
					schema: { actionPlanUrls: [{ name: "", url: "" }] },
				} as never),
			),
		).toBe("custom");
	});

	it("is undecided when the group is empty or absent", () => {
		expect(
			deriveSourceMode(
				"contact",
				completeDeclaration({ contact: null } as never),
			),
		).toBeNull();
		expect(
			isSourceModeUndecided(
				"contact",
				completeDeclaration({ contact: {} } as never),
			),
		).toBe(true);
	});

	it("returns to undecided when every content field is cleared", () => {
		const d = completeDeclaration({
			contact: { name: "", email: "", url: "" },
		} as never);
		expect(deriveSourceMode("contact", d)).toBeNull();
	});
});

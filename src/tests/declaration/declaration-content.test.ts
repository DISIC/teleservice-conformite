import { describe, expect, it } from "vitest";
import { extractDeclarationContentToPublish } from "~/utils/declaration-content";
import { completeDeclaration } from "./declaration.fixture";
import { hasContentChangedSincePublish } from "~/utils/declaration/status";

describe("extractDeclarationContentToPublish", () => {
	it("publishes human-readable labels, not stored values", () => {
		const content = extractDeclarationContentToPublish(
			completeDeclaration({
				audit: {
					isRealised: true,
					rgaa_version: "rgaa_5",
					usedTools: [{ name: "wave" }],
					testEnvironments: [{ name: "voiceover_safari" }],
				},
			} as never),
		);
		expect(content.appKindLabel).toBe("Site web");
		expect(content.audit.rgaa_version).toBe("RGAA 5");
		expect(content.audit.usedTools).toEqual(["Wave"]);
		expect(content.audit.testEnvironments).toEqual(["VoiceOver (Safari)"]);
	});

	it("publishes only the contact's reachable channels, not their name", () => {
		const content = extractDeclarationContentToPublish(completeDeclaration());
		expect(content.contact).toEqual({ email: "a11y@example.fr", url: "" });
	});

	it("never fails on an empty declaration — everything coalesces", () => {
		const content = extractDeclarationContentToPublish(
			completeDeclaration({
				name: null,
				entity: null,
				audit: null,
				schema: null,
				contact: null,
			} as never),
		);
		expect(content.name).toBe("");
		expect(content.audit.rgaa_version).toBe("RGAA 4");
		expect(content.schema.actionPlanUrls).toEqual([]);
	});
});

describe("hasContentChangedSincePublish", () => {
	const published = () => {
		const declaration = completeDeclaration();
		return completeDeclaration({
			publishedContent: JSON.stringify(
				extractDeclarationContentToPublish(declaration),
			),
		});
	};

	it("is false for a draft — nothing to differ from", () => {
		expect(hasContentChangedSincePublish(completeDeclaration())).toBe(false);
	});

	it("is false right after publishing", () => {
		expect(hasContentChangedSincePublish(published())).toBe(false);
	});

	it("detects an edit to published content", () => {
		const declaration = published();
		expect(
			hasContentChangedSincePublish({
				...declaration,
				contact: { ...declaration.contact, email: "autre@example.fr" },
			} as never),
		).toBe(true);
	});

	it("ignores edits to fields outside the public snapshot", () => {
		const declaration = published();
		expect(
			hasContentChangedSincePublish({
				...declaration,
				contact: { ...declaration.contact, name: "Autre référent" },
			} as never),
		).toBe(false);
	});
});

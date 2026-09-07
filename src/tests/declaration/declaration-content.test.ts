import { describe, expect, it } from "vitest";
import {
	extractDeclarationContentToPublish,
	parsePublishedDeclaration,
} from "~/utils/declaration-content";
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

	it("dates the snapshot with the publish action, falling back to the row", () => {
		const explicit = extractDeclarationContentToPublish(
			completeDeclaration({ first_published_at: "2024-03-24T10:00:00.000Z" }),
			{ publishedAt: "2026-08-27T09:30:00.000Z" },
		);
		expect(explicit.publishedAt).toBe("2026-08-27");
		expect(explicit.firstPublishedAt).toBe("2024-03-24");

		const fromRow = extractDeclarationContentToPublish(
			completeDeclaration({ published_at: "2026-08-27T09:30:00.000Z" }),
		);
		expect(fromRow.publishedAt).toBe("2026-08-27");
		expect(fromRow.firstPublishedAt).toBe("2026-08-27");
	});

	it("records whether an audit was performed", () => {
		expect(
			extractDeclarationContentToPublish(completeDeclaration()).audit
				.isRealised,
		).toBe(false);
		expect(
			extractDeclarationContentToPublish(
				completeDeclaration({
					audit: { isRealised: true, realisedBy: "Orion", rate: 74 },
				} as never),
			).audit.isRealised,
		).toBe(true);
	});
});

describe("parsePublishedDeclaration", () => {
	it("round-trips a snapshot written by the extractor", () => {
		const snapshot = extractDeclarationContentToPublish(completeDeclaration(), {
			publishedAt: "2026-08-27T09:30:00.000Z",
		});
		expect(parsePublishedDeclaration(JSON.stringify(snapshot))).toEqual(
			snapshot,
		);
	});

	it("treats anything off-contract as no snapshot", () => {
		expect(parsePublishedDeclaration(null)).toBeNull();
		expect(parsePublishedDeclaration("not json")).toBeNull();
		expect(parsePublishedDeclaration('{"name":"legacy"}')).toBeNull();
	});
});

describe("hasContentChangedSincePublish", () => {
	const published = () => {
		const declaration = completeDeclaration({
			first_published_at: "2026-08-27T09:30:00.000Z",
		});
		return completeDeclaration({
			first_published_at: "2026-08-27T09:30:00.000Z",
			published_at: "2026-08-27T09:30:00.000Z",
			publishedContent: JSON.stringify(
				extractDeclarationContentToPublish(declaration, {
					publishedAt: "2026-08-27T09:30:00.000Z",
				}),
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

	it("flags an unreadable snapshot so it gets republished", () => {
		expect(
			hasContentChangedSincePublish(
				completeDeclaration({ publishedContent: '{"name":"legacy"}' }),
			),
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

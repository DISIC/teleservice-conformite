import { describe, expect, it } from "vitest";
import {
	extractDeclarationContentToPublish,
	parsePublishedDeclaration,
} from "~/utils/declaration-content";
import { completeDeclaration } from "./declaration.fixture";

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
			{ publishedAt: new Date("2026-08-27T09:30:00.000Z") },
		);
		expect(explicit.publishedAt).toBe("2026-08-27");
		expect(explicit.firstPublishedAt).toBe("2024-03-24");

		const fromRow = extractDeclarationContentToPublish(
			completeDeclaration({ published_at: "2026-08-27T09:30:00.000Z" }),
		);
		expect(fromRow.publishedAt).toBe("2026-08-27");
		expect(fromRow.firstPublishedAt).toBe("2026-08-27");
	});

	it("publishes no audit detail when no audit was realised", () => {
		const content = extractDeclarationContentToPublish(
			completeDeclaration({
				audit: {
					isRealised: false,
					realisedBy: "Orion",
					rate: 74,
					rgaa_version: "rgaa_5",
					compliantElements: "Accueil",
					nonCompliantElements: "Images sans alternative",
					optionalElements: "Cartes IGN",
					disproportionnedCharge: "Archives PDF",
					usedTools: [{ name: "wave" }],
					testEnvironments: [{ name: "voiceover_safari" }],
					technologies: [{ name: "React" }],
				},
			} as never),
		);
		expect(content.audit).toEqual({
			isRealised: false,
			rgaa_version: "RGAA 4",
			realised_by: "",
			rate: 0,
			nonCompliantElements: "",
			disproportionnedCharge: "",
			optionalElements: "",
			compliantElements: "",
			technologies: [],
			testEnvironments: [],
			usedTools: [],
		});
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
			publishedAt: new Date("2026-08-27T09:30:00.000Z"),
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

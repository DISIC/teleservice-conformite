import { describe, expect, it } from "vitest";
import {
	extractDeclarationContentToDeposit,
	parseDepositedDeclaration,
} from "~/domain/declaration/deposited/snapshot";
import { completeDeclaration } from "../declaration.fixture";

describe("extractDeclarationContentToDeposit", () => {
	it("deposits human-readable labels, not stored values", () => {
		const content = extractDeclarationContentToDeposit(
			completeDeclaration({
				audit: {
					isRealised: true,
					rgaa_version: "rgaa_4",
					usedTools: [{ name: "wave" }],
					testEnvironments: [{ name: "voiceover_safari" }],
				},
			} as never),
		);
		expect(content.appKindLabel).toBe("Site web");
		expect(content.audit.rgaa_version).toBe("RGAA 4");
		expect(content.audit.usedTools).toEqual(["Wave"]);
		expect(content.audit.testEnvironments).toEqual(["VoiceOver (Safari)"]);
	});

	it("previews a manual draft as a first publication on the deposit day", () => {
		const content = extractDeclarationContentToDeposit(
			completeDeclaration({
				fromSource: "manual",
				first_published_at: null,
			}),
			{ depositedAt: new Date("2026-11-10T09:00:00.000Z") },
		);
		expect(content.firstPublishedAt).toBe("2026-11-10");
		expect(content.depositedAt).toBe("2026-11-10");
	});

	it("leaves the assessment tools out of an RGAA 5 declaration", () => {
		const content = extractDeclarationContentToDeposit(
			completeDeclaration({
				audit: {
					isRealised: true,
					rgaa_version: "rgaa_5",
					usedTools: [{ name: "wave" }],
				},
			} as never),
		);
		expect(content.audit.rgaa_version).toBe("RGAA 5");
		expect(content.audit.usedTools).toEqual([]);
	});

	it("deposits only the contact's reachable channels, not their name", () => {
		const content = extractDeclarationContentToDeposit(completeDeclaration());
		expect(content.contact).toEqual({ email: "a11y@example.fr", url: "" });
	});

	it("never fails on an empty declaration — everything coalesces", () => {
		const content = extractDeclarationContentToDeposit(
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

	it("dates the snapshot with the deposit action, falling back to the row", () => {
		const explicit = extractDeclarationContentToDeposit(
			completeDeclaration({ first_published_at: "2024-03-24T10:00:00.000Z" }),
			{ depositedAt: new Date("2026-08-27T09:30:00.000Z") },
		);
		expect(explicit.depositedAt).toBe("2026-08-27");
		expect(explicit.firstPublishedAt).toBe("2024-03-24");

		const fromRow = extractDeclarationContentToDeposit(
			completeDeclaration({
				first_published_at: null,
				deposited_at: "2026-08-27T09:30:00.000Z",
			}),
		);
		expect(fromRow.depositedAt).toBe("2026-08-27");
		expect(fromRow.firstPublishedAt).toBe("2026-08-27");
	});

	it("deposits no audit detail when no audit was realised", () => {
		const content = extractDeclarationContentToDeposit(
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
			blockingElements: "",
			nonCompliantElements: "",
			disproportionnedCharge: "",
			optionalElements: "",
			compliantElements: "",
			technologies: [],
			testEnvironments: [],
			usedTools: [],
		});
	});

	it("deposits blocking elements only when an RGAA 5 audit found some", () => {
		const withBlocking = (
			hasBlockingElements: boolean,
			rgaa_version: "rgaa_4" | "rgaa_5" = "rgaa_5",
		) =>
			extractDeclarationContentToDeposit(
				completeDeclaration({
					audit: {
						isRealised: true,
						toVerify: false,
						rgaa_version,
						hasBlockingElements,
						blockingElements: "Paiement inaccessible au clavier",
					},
				}),
			).audit.blockingElements;
		expect(withBlocking(true)).toBe("Paiement inaccessible au clavier");
		expect(withBlocking(false)).toBe("");
		expect(withBlocking(true, "rgaa_4")).toBe("");
	});

	it("reads a snapshot deposited before blocking elements as having none", () => {
		const snapshot = extractDeclarationContentToDeposit(completeDeclaration(), {
			depositedAt: new Date("2026-08-27T09:30:00.000Z"),
		});
		const { blockingElements: _, ...legacyAudit } = snapshot.audit;
		expect(
			parseDepositedDeclaration(
				JSON.stringify({ ...snapshot, audit: legacyAudit }),
			)?.audit.blockingElements,
		).toBe("");
	});

	it("records whether an audit was performed", () => {
		expect(
			extractDeclarationContentToDeposit(completeDeclaration()).audit
				.isRealised,
		).toBe(false);
		expect(
			extractDeclarationContentToDeposit(
				completeDeclaration({
					audit: { isRealised: true, realisedBy: "Orion", rate: 74 },
				} as never),
			).audit.isRealised,
		).toBe(true);
	});
});

describe("parseDepositedDeclaration", () => {
	it("round-trips a snapshot written by the extractor", () => {
		const snapshot = extractDeclarationContentToDeposit(completeDeclaration(), {
			depositedAt: new Date("2026-08-27T09:30:00.000Z"),
		});
		expect(parseDepositedDeclaration(JSON.stringify(snapshot))).toEqual(
			snapshot,
		);
	});

	it("treats anything off-contract as no snapshot", () => {
		expect(parseDepositedDeclaration(null)).toBeNull();
		expect(parseDepositedDeclaration("not json")).toBeNull();
		expect(parseDepositedDeclaration('{"name":"legacy"}')).toBeNull();
	});
});

import { describe, expect, it } from "vitest";
import { extractDeclarationContentToPublish } from "~/domain/declaration/published/snapshot";
import {
	getDeclarationStatus,
	getEditingMode,
	hasContentChangedSincePublish,
} from "~/domain/declaration/status";
import { completeDeclaration } from "./declaration.fixture";

describe("getDeclarationStatus", () => {
	it("is draft when unpublished with no snapshot", () => {
		expect(
			getDeclarationStatus({ status: "unpublished", publishedContent: null }),
		).toBe("draft");
	});

	it("treats an empty snapshot like no snapshot", () => {
		expect(
			getDeclarationStatus({ status: "unpublished", publishedContent: "" }),
		).toBe("draft");
	});

	it("is modified when unpublished but a snapshot exists", () => {
		expect(
			getDeclarationStatus({ status: "unpublished", publishedContent: "{}" }),
		).toBe("modified");
	});

	it("is published when the status column says so", () => {
		expect(
			getDeclarationStatus({ status: "published", publishedContent: "{}" }),
		).toBe("published");
	});
});

describe("getEditingMode", () => {
	it("is sequential only for a never-published draft", () => {
		expect(getEditingMode("draft")).toBe("sequential");
		expect(getEditingMode("modified")).toBe("standalone");
		expect(getEditingMode("published")).toBe("standalone");
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
					publishedAt: new Date("2026-08-27T09:30:00.000Z"),
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

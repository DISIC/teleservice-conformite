import { describe, expect, it } from "vitest";
import {
	getDeclarationStatus,
	getEditingMode,
	hasContentChangedSinceDeposit,
	statusAfterEdit,
} from "~/domain/declaration/status";
import {
	completeDeclaration,
	depositedDeclaration,
} from "./declaration.fixture";

describe("getDeclarationStatus", () => {
	it("is draft with no snapshot", () => {
		expect(getDeclarationStatus({ depositedContent: null })).toBe("draft");
	});

	it("treats an empty snapshot like no snapshot", () => {
		expect(getDeclarationStatus({ depositedContent: "" })).toBe("draft");
	});

	it("is deposited once a snapshot exists", () => {
		expect(getDeclarationStatus({ depositedContent: "{}" })).toBe("deposited");
	});

	it("is published once the link to the public page is verified", () => {
		expect(
			getDeclarationStatus({
				depositedContent: "{}",
				link_verified_at: "2026-11-24T00:00:00.000Z",
			}),
		).toBe("published");
	});

	it("is never published without a snapshot, whatever the verification date", () => {
		expect(
			getDeclarationStatus({
				depositedContent: null,
				link_verified_at: "2026-11-24T00:00:00.000Z",
			}),
		).toBe("draft");
	});

	it("stays published while modified since the last deposit", () => {
		const modified = {
			...depositedDeclaration(),
			link_verified_at: "2026-11-24T00:00:00.000Z",
			status: "undeposited" as const,
		};
		expect(getDeclarationStatus(modified)).toBe("published");
	});

	it("stays deposited while modified since the last deposit", () => {
		const modified = {
			...depositedDeclaration(),
			status: "undeposited" as const,
		};
		expect(getDeclarationStatus(modified)).toBe("deposited");
	});
});

describe("getEditingMode", () => {
	it("is sequential only for a never-deposited draft", () => {
		expect(getEditingMode("draft")).toBe("sequential");
		expect(getEditingMode("deposited")).toBe("standalone");
		expect(getEditingMode("published")).toBe("standalone");
	});
});

describe("hasContentChangedSinceDeposit", () => {
	it("is false for a draft — nothing to differ from", () => {
		expect(hasContentChangedSinceDeposit(completeDeclaration())).toBe(false);
	});

	it("is false right after depositing", () => {
		expect(hasContentChangedSinceDeposit(depositedDeclaration())).toBe(false);
	});

	it("detects an edit to deposited content", () => {
		const declaration = depositedDeclaration();
		expect(
			hasContentChangedSinceDeposit({
				...declaration,
				contact: { ...declaration.contact, email: "autre@example.fr" },
			} as never),
		).toBe(true);
	});

	it("flags an unreadable snapshot so it gets redeposited", () => {
		expect(
			hasContentChangedSinceDeposit(
				completeDeclaration({ depositedContent: '{"name":"legacy"}' }),
			),
		).toBe(true);
	});

	it("ignores edits to fields outside the public snapshot", () => {
		const declaration = depositedDeclaration();
		expect(
			hasContentChangedSinceDeposit({
				...declaration,
				contact: { ...declaration.contact, name: "Autre référent" },
			} as never),
		).toBe(false);
	});
});

describe("statusAfterEdit", () => {
	it("keeps a draft's column — there is no snapshot to drift from", () => {
		expect(statusAfterEdit(completeDeclaration())).toBe("undeposited");
	});

	it("turns Déposée into Modifiée when public content drifts", () => {
		const declaration = depositedDeclaration();
		expect(
			statusAfterEdit({
				...declaration,
				contact: { ...declaration.contact, email: "autre@example.fr" },
			}),
		).toBe("undeposited");
	});

	it("turns Modifiée back into Déposée when the row matches its snapshot again", () => {
		expect(
			statusAfterEdit({ ...depositedDeclaration(), status: "undeposited" }),
		).toBe("deposited");
	});
});

import { describe, expect, it } from "vitest";
import {
	completeDeclaration,
	depositedDeclaration,
} from "./declaration.fixture";
import {
	getDeclarationState,
	isToCompleteRevealed,
} from "~/domain/declaration/state";

describe("getDeclarationState", () => {
	it("renders no notice for a clean deposited declaration", () => {
		const d = completeDeclaration({
			status: "deposited",
			depositedContent: "{}",
		} as never);
		expect(getDeclarationState(d)).toBeNull();
	});

	it("is ready for a complete draft with no AI flag", () => {
		expect(getDeclarationState(completeDeclaration())).toBe("ready");
	});

	it("is incomplete for a draft failing the gate", () => {
		const d = completeDeclaration({ contact: {} } as never);
		expect(getDeclarationState(d)).toBe("incomplete");
	});

	it("to-verify wins over incomplete on the draft branch", () => {
		const d = completeDeclaration({
			contact: {},
			audit: { isRealised: false, toVerify: true },
		} as never);
		expect(getDeclarationState(d)).toBe("to-verify");
	});

	it("keeps a modified declaration on the deposited branch", () => {
		const modified = {
			...depositedDeclaration(),
			status: "undeposited" as const,
		};
		expect(getDeclarationState(modified)).toBe("deposited-modified");
	});

	it("is deposited-modified for a complete declaration edited since deposit", () => {
		const d = completeDeclaration({ depositedContent: "{}" } as never);
		expect(getDeclarationState(d)).toBe("deposited-modified");
	});

	it("is deposited-incomplete when an edit removed required content", () => {
		const d = completeDeclaration({
			depositedContent: "{}",
			contact: {},
		} as never);
		expect(getDeclarationState(d)).toBe("deposited-incomplete");
	});
});

describe("isToCompleteRevealed", () => {
	it("hides the guidance through the first pass of the walkthrough", () => {
		expect(isToCompleteRevealed("sequential", false)).toBe(false);
	});

	it("reveals it once the declarant has come back", () => {
		expect(isToCompleteRevealed("sequential", true)).toBe(true);
	});

	it("always reveals it outside the walkthrough", () => {
		expect(isToCompleteRevealed("standalone", false)).toBe(true);
	});

	it("reveals it on the first visit of an imported declaration", () => {
		expect(isToCompleteRevealed("sequential", false, true)).toBe(true);
	});
});

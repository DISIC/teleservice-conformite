import { describe, expect, it } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import { getDeclarationState } from "~/utils/declaration/state";

describe("getDeclarationState", () => {
	it("renders no notice for a clean published declaration", () => {
		const d = completeDeclaration({
			status: "published",
			publishedContent: "{}",
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

	it("is published-modified for a complete declaration edited since publish", () => {
		const d = completeDeclaration({ publishedContent: "{}" } as never);
		expect(getDeclarationState(d)).toBe("published-modified");
	});

	it("is published-incomplete when an edit removed required content", () => {
		const d = completeDeclaration({
			publishedContent: "{}",
			contact: {},
		} as never);
		expect(getDeclarationState(d)).toBe("published-incomplete");
	});
});

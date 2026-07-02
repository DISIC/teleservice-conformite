import { describe, expect, it } from "vitest";
import {
	getDeclarationStatus,
	getEditingMode,
} from "~/utils/declaration/status";

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

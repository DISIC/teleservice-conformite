import { describe, expect, it } from "vitest";
import {
	DECLARATIONS_PER_PAGE,
	listOwnedDeclarations,
} from "~/server/api/routers/declaration/service";
import { fakePayload } from "../payload.fake";
import { completeDeclaration } from "./declaration.fixture";

const CALLER = 7;

// The fake reads the join as a plain field: one approved right per row, on the row itself.
const owned = (id: number, createdAt: string, user = CALLER) =>
	completeDeclaration({
		id,
		name: `Déclaration ${id}`,
		createdAt,
		accessRights: { user, status: "approved" },
	} as never);

describe("listOwnedDeclarations", () => {
	it("returns only the caller's declarations, newest first", async () => {
		const { payload } = fakePayload({
			declarations: [
				owned(1, "2026-01-01T00:00:00.000Z"),
				owned(2, "2026-03-01T00:00:00.000Z"),
				owned(3, "2026-02-01T00:00:00.000Z", 99),
			],
		});

		const result = await listOwnedDeclarations(payload, CALLER);

		expect(result.docs.map((doc) => doc.id)).toEqual([2, 1]);
		expect(result).toMatchObject({ page: 1, totalPages: 1, totalDocs: 2 });
	});

	it("serves the overflow on the next page", async () => {
		const { payload } = fakePayload({
			declarations: Array.from({ length: DECLARATIONS_PER_PAGE + 2 }, (_, i) =>
				owned(i + 1, `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`),
			),
		});

		const first = await listOwnedDeclarations(payload, CALLER, 1);
		const second = await listOwnedDeclarations(payload, CALLER, 2);

		expect(first.docs).toHaveLength(DECLARATIONS_PER_PAGE);
		expect(first.docs[0]?.id).toBe(DECLARATIONS_PER_PAGE + 2);
		expect(second.docs.map((doc) => doc.id)).toEqual([2, 1]);
		expect(second).toMatchObject({
			page: 2,
			totalPages: 2,
			limit: DECLARATIONS_PER_PAGE,
		});
	});
});

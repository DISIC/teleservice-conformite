import type { Payload } from "payload";
import { describe, expect, it, vi } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import { loadOwnedDeclaration } from "~/server/api/utils/declaration-access";

function stubPayload({
	declaration = completeDeclaration() as unknown,
	approvedRights = 1,
} = {}) {
	const payload = {
		findByID: vi.fn().mockResolvedValue(declaration),
		find: vi.fn().mockResolvedValue({ totalDocs: approvedRights, docs: [] }),
	};
	return { payload: payload as unknown as Payload, find: payload.find };
}

describe("loadOwnedDeclaration", () => {
	it("returns the declaration when the caller holds an approved access right", async () => {
		const { payload, find } = stubPayload();

		const declaration = await loadOwnedDeclaration(payload, 7, 1);

		expect(declaration.id).toBe(1);
		expect(find).toHaveBeenCalledWith(
			expect.objectContaining({
				collection: "access-rights",
				where: {
					declaration: { equals: 1 },
					user: { equals: 7 },
					status: { equals: "approved" },
				},
			}),
		);
	});

	it("rejects a caller without an approved access right", async () => {
		const { payload } = stubPayload({ approvedRights: 0 });

		await expect(loadOwnedDeclaration(payload, 7, 1)).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("reports an unknown declaration as not found", async () => {
		const { payload } = stubPayload({ declaration: null });

		await expect(loadOwnedDeclaration(payload, 7, 999)).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("refuses an anonymous or malformed request before touching the database", async () => {
		const { payload, find } = stubPayload();

		await expect(loadOwnedDeclaration(payload, 0, 1)).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
		await expect(
			loadOwnedDeclaration(payload, 7, Number.NaN),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		expect(find).not.toHaveBeenCalled();
	});

	it("only reaches trashed declarations when asked to", async () => {
		const { payload } = stubPayload();

		await loadOwnedDeclaration(payload, 7, 1);
		await loadOwnedDeclaration(payload, 7, 1, { trash: true });

		const calls = (payload.findByID as ReturnType<typeof vi.fn>).mock.calls;
		expect(calls[0]?.[0]).toMatchObject({ trash: false });
		expect(calls[1]?.[0]).toMatchObject({ trash: true });
	});
});

import { describe, expect, it, vi } from "vitest";
import { loadOwnedDeclaration } from "~/server/api/utils/declaration-access";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { fakePayload } from "../payload.fake";
import { completeDeclaration } from "./declaration.fixture";

const CALLER = 7;

const accessRight = (overrides: Record<string, unknown> = {}) => ({
	id: 1,
	declaration: 1,
	user: CALLER,
	status: "approved",
	...overrides,
});

const seeded = (
	declaration: PopulatedDeclaration = completeDeclaration(),
	rights = [accessRight()],
) => fakePayload({ declarations: [declaration], "access-rights": rights });

describe("loadOwnedDeclaration", () => {
	it("returns the declaration when the caller holds an approved access right on it", async () => {
		const { payload } = seeded();

		const declaration = await loadOwnedDeclaration(payload, CALLER, 1);

		expect(declaration.id).toBe(1);
		expect(declaration.entity).toEqual({
			id: 1,
			name: "DINUM",
			kind: "Protection sociale",
		});
	});

	it("rejects a caller without any access right", async () => {
		const { payload } = seeded(completeDeclaration(), []);

		await expect(
			loadOwnedDeclaration(payload, CALLER, 1),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
	});

	it("counts neither a pending right, nor someone else's, nor one on another declaration", async () => {
		for (const right of [
			accessRight({ status: "pending" }),
			accessRight({ user: CALLER + 1 }),
			accessRight({ declaration: 2 }),
		]) {
			const { payload } = seeded(completeDeclaration(), [right]);
			await expect(
				loadOwnedDeclaration(payload, CALLER, 1),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		}
	});

	it("reports an unknown declaration as not found", async () => {
		const { payload } = seeded(completeDeclaration(), [
			accessRight({ declaration: 999 }),
		]);

		await expect(
			loadOwnedDeclaration(payload, CALLER, 999),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("refuses an anonymous or malformed request before touching the database", async () => {
		const { payload } = seeded();
		const find = vi.spyOn(payload, "find");
		const findByID = vi.spyOn(payload, "findByID");

		await expect(loadOwnedDeclaration(payload, 0, 1)).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
		await expect(
			loadOwnedDeclaration(payload, CALLER, Number.NaN),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		expect(find).not.toHaveBeenCalled();
		expect(findByID).not.toHaveBeenCalled();
	});

	it("only reaches a trashed declaration when asked to", async () => {
		const { payload } = seeded(
			completeDeclaration({ deletedAt: "2026-09-01T00:00:00.000Z" }),
		);

		await expect(
			loadOwnedDeclaration(payload, CALLER, 1),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		const trashed = await loadOwnedDeclaration(payload, CALLER, 1, {
			trash: true,
		});
		expect(trashed.id).toBe(1);
	});
});

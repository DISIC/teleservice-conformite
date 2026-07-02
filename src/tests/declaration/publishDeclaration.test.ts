import type { Payload } from "payload";
import { describe, expect, it, vi } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import { publishDeclaration } from "~/server/api/routers/declaration/service";
import { extractDeclarationContentToPublish } from "~/utils/declaration-content";

function stubPayload(
	declaration: ReturnType<typeof completeDeclaration>,
	{ hasAccess = true } = {},
) {
	const payload = {
		findByID: vi.fn().mockResolvedValue(declaration),
		find: vi.fn().mockResolvedValue({ totalDocs: hasAccess ? 1 : 0, docs: [] }),
		update: vi.fn().mockResolvedValue(declaration),
	};
	return { payload: payload as unknown as Payload, update: payload.update };
}

describe("publishDeclaration", () => {
	it("never writes when the gate fails — incomplete declarations cannot publish", async () => {
		const { payload, update } = stubPayload(
			completeDeclaration({ contact: null } as never),
		);

		await expect(publishDeclaration(payload, 1, 1)).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(update).not.toHaveBeenCalled();
	});

	it("writes the server-built snapshot for a complete declaration", async () => {
		const declaration = completeDeclaration();
		const { payload, update } = stubPayload(declaration);

		await publishDeclaration(payload, 1, 1);

		expect(update).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith(
			expect.objectContaining({
				collection: "declarations",
				id: 1,
				data: expect.objectContaining({
					status: "published",
					publishedContent: JSON.stringify(
						extractDeclarationContentToPublish(declaration),
					),
					published_at: expect.any(String),
				}),
			}),
		);
	});

	it("gates a Modifiée republish too — there is no fast path", async () => {
		const { payload, update } = stubPayload(
			completeDeclaration({
				publishedContent: '{"name":"previous snapshot"}',
				contact: null,
			} as never),
		);

		await expect(publishDeclaration(payload, 1, 1)).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(update).not.toHaveBeenCalled();
	});

	it("rejects a user without an approved access right, without writing", async () => {
		const { payload, update } = stubPayload(completeDeclaration(), {
			hasAccess: false,
		});

		await expect(publishDeclaration(payload, 1, 1)).rejects.toMatchObject({
			code: "UNAUTHORIZED",
		});
		expect(update).not.toHaveBeenCalled();
	});
});

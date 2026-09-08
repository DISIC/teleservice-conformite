import type { Payload } from "payload";
import { describe, expect, it, vi } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import { publishDeclaration } from "~/server/api/routers/declaration/service";
import { extractDeclarationContentToPublish } from "~/domain/declaration/published/snapshot";

function stubPayload(declaration: ReturnType<typeof completeDeclaration>) {
	const payload = {
		update: vi.fn().mockResolvedValue(declaration),
	};
	return { payload: payload as unknown as Payload, update: payload.update };
}

describe("publishDeclaration", () => {
	it("never writes when the gate fails — incomplete declarations cannot publish", async () => {
		const declaration = completeDeclaration({ contact: null } as never);
		const { payload, update } = stubPayload(declaration);

		await expect(
			publishDeclaration(payload, declaration),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(update).not.toHaveBeenCalled();
	});

	it("writes the server-built snapshot for a complete declaration", async () => {
		const declaration = completeDeclaration();
		const { payload, update } = stubPayload(declaration);

		await publishDeclaration(payload, declaration);

		expect(update).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith(
			expect.objectContaining({
				collection: "declarations",
				id: 1,
				data: expect.objectContaining({
					status: "published",
					publishedContent: expect.any(String),
					published_at: expect.any(String),
					first_published_at: expect.any(String),
				}),
			}),
		);
		const data = update.mock.calls[0]?.[0]?.data ?? {};
		expect(JSON.parse(data.publishedContent)).toEqual(
			extractDeclarationContentToPublish(declaration, {
				publishedAt: new Date(data.published_at),
			}),
		);
		expect(data.first_published_at).toBe(data.published_at);
	});

	it("keeps a declarant-supplied initial publication date", async () => {
		const declaration = completeDeclaration({
			first_published_at: "2024-03-24T00:00:00.000Z",
		});
		const { payload, update } = stubPayload(declaration);

		await publishDeclaration(payload, declaration);

		const data = update.mock.calls[0]?.[0]?.data ?? {};
		expect(data.first_published_at).toBe("2024-03-24T00:00:00.000Z");
		expect(JSON.parse(data.publishedContent).firstPublishedAt).toBe(
			"2024-03-24",
		);
	});

	it("gates a Modifiée republish too — there is no fast path", async () => {
		const declaration = completeDeclaration({
			publishedContent: '{"name":"previous snapshot"}',
			contact: null,
		} as never);
		const { payload, update } = stubPayload(declaration);

		await expect(
			publishDeclaration(payload, declaration),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(update).not.toHaveBeenCalled();
	});
});

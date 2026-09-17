import { describe, expect, it } from "vitest";
import { publishDeclaration } from "~/server/api/routers/declaration/service";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { fakePayload } from "../payload.fake";
import { completeDeclaration } from "./declaration.fixture";

const seeded = (declaration: PopulatedDeclaration) =>
	fakePayload({ declarations: [declaration] });

describe("publishDeclaration", () => {
	it("never writes when the gate fails — incomplete declarations cannot publish", async () => {
		const declaration = completeDeclaration({ contact: null } as never);
		const { payload, read } = seeded(declaration);

		await expect(
			publishDeclaration(payload, declaration),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(read("declarations", 1)).toBe(declaration);
	});

	it("publishes a server-built snapshot dated by the publish action", async () => {
		const declaration = completeDeclaration();
		const { payload, read } = seeded(declaration);

		const result = await publishDeclaration(payload, declaration);

		expect(result.status).toBe("published");
		expect(result.published_at).toEqual(expect.any(String));
		expect(JSON.parse(result.publishedContent ?? "")).toMatchObject({
			name: "Mon service",
			entityName: "DINUM",
			appKindLabel: "Site web",
			publishedAt: result.published_at?.slice(0, 10),
			audit: { isRealised: false },
			contact: { email: "a11y@example.fr", url: "" },
		});
		expect(read("declarations", 1)).toEqual(result);
	});

	it("keeps the initial publication date fixed before publishing", async () => {
		const declaration = completeDeclaration({
			first_published_at: "2024-03-24T00:00:00.000Z",
		});
		const { payload } = seeded(declaration);

		const result = await publishDeclaration(payload, declaration);

		expect(result.first_published_at).toBe("2024-03-24T00:00:00.000Z");
		expect(JSON.parse(result.publishedContent ?? "").firstPublishedAt).toBe(
			"2024-03-24",
		);
	});

	it("gates a Modifiée republish too — there is no fast path", async () => {
		const declaration = completeDeclaration({
			publishedContent: '{"name":"previous snapshot"}',
			contact: null,
		} as never);
		const { payload, read } = seeded(declaration);

		await expect(
			publishDeclaration(payload, declaration),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(read("declarations", 1)).toBe(declaration);
	});
});

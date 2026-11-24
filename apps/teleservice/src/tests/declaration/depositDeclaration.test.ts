import { describe, expect, it } from "vitest";
import { depositDeclaration } from "~/server/api/routers/declaration/service";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { fakePayload } from "../payload.fake";
import { completeDeclaration } from "./declaration.fixture";

const seeded = (declaration: PopulatedDeclaration) =>
	fakePayload({ declarations: [declaration] });

describe("depositDeclaration", () => {
	it("never writes when the gate fails — incomplete declarations cannot deposit", async () => {
		const declaration = completeDeclaration({ contact: null } as never);
		const { payload, read } = seeded(declaration);

		await expect(
			depositDeclaration(payload, declaration),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(read("declarations", 1)).toBe(declaration);
	});

	it("deposits a server-built snapshot dated by the deposit action", async () => {
		const declaration = completeDeclaration();
		const { payload, read } = seeded(declaration);

		const result = await depositDeclaration(payload, declaration);

		expect(result.status).toBe("deposited");
		expect(result.deposited_at).toEqual(expect.any(String));
		expect(JSON.parse(result.depositedContent ?? "")).toMatchObject({
			name: "Mon service",
			entityName: "DINUM",
			appKindLabel: "Site web",
			depositedAt: result.deposited_at?.slice(0, 10),
			audit: { isRealised: false },
			contact: { email: "a11y@example.fr", url: "" },
		});
		expect(read("declarations", 1)).toEqual(result);
	});

	it("keeps the initial publication date fixed before depositing", async () => {
		const declaration = completeDeclaration({
			first_published_at: "2024-03-24T00:00:00.000Z",
		});
		const { payload } = seeded(declaration);

		const result = await depositDeclaration(payload, declaration);

		expect(result.first_published_at).toBe("2024-03-24T00:00:00.000Z");
		expect(JSON.parse(result.depositedContent ?? "").firstPublishedAt).toBe(
			"2024-03-24",
		);
	});

	it("dates a manual declaration's initial publication by its first deposit", async () => {
		const declaration = completeDeclaration({
			fromSource: "manual",
			first_published_at: null,
		});
		const { payload } = seeded(declaration);

		const result = await depositDeclaration(payload, declaration);

		expect(result.first_published_at).toBe(result.deposited_at);
		expect(JSON.parse(result.depositedContent ?? "").firstPublishedAt).toBe(
			result.deposited_at?.slice(0, 10),
		);
	});

	it("keeps a manual declaration's initial publication on redeposit", async () => {
		const declaration = completeDeclaration({
			fromSource: "manual",
			deposited_at: "2025-01-10T00:00:00.000Z",
			first_published_at: "2025-01-10T00:00:00.000Z",
		});
		const { payload } = seeded(declaration);

		const result = await depositDeclaration(payload, declaration);

		expect(result.first_published_at).toBe("2025-01-10T00:00:00.000Z");
	});

	it("gates a Modifiée redeposit too — there is no fast path", async () => {
		const declaration = completeDeclaration({
			depositedContent: '{"name":"previous snapshot"}',
			contact: null,
		} as never);
		const { payload, read } = seeded(declaration);

		await expect(
			depositDeclaration(payload, declaration),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
		});
		expect(read("declarations", 1)).toBe(declaration);
	});
});

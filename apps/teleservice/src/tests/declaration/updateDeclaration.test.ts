import { describe, expect, it } from "vitest";
import { declarationToGeneralValues } from "~/forms/declaration/declarationSchema";
import { updateDeclaration } from "~/server/api/routers/declaration/service";
import { fakePayload } from "../payload.fake";
import { completeDeclaration } from "./declaration.fixture";

const OTHER_ENTITY = { id: 2, name: "Autre administration" };

describe("updateDeclaration — organisation name", () => {
	it("renames the declaration's own entity, never one named by the client", async () => {
		const declaration = completeDeclaration();
		const { payload, read } = fakePayload({
			declarations: [declaration],
			entities: [{ id: 1, name: "DINUM" }, OTHER_ENTITY],
		});

		await updateDeclaration(payload, declaration, {
			...declarationToGeneralValues(declaration).general,
			organisation: "Nouveau nom",
			entityId: OTHER_ENTITY.id,
		} as never);

		expect(read("entities", 1)).toMatchObject({ name: "Nouveau nom" });
		expect(read("entities", OTHER_ENTITY.id)).toEqual(OTHER_ENTITY);
	});

	it("writes no entity when the declaration has none", async () => {
		const declaration = completeDeclaration({ entity: null });
		const { payload, read } = fakePayload({
			declarations: [declaration],
			entities: [OTHER_ENTITY],
		});

		await updateDeclaration(payload, declaration, {
			...declarationToGeneralValues(declaration).general,
			organisation: "Nouveau nom",
		});

		expect(read("entities", OTHER_ENTITY.id)).toEqual(OTHER_ENTITY);
	});
});

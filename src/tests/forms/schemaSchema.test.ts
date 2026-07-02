import { describe, expect, it } from "vitest";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	declarationToSchemaValues,
	schemaDefaultValues,
	schemaDraft,
	schemaForm,
} from "~/forms/schema/schemaSchema";

describe("schemaForm (strict)", () => {
	it("passes with a name alone — the document url is optional", () => {
		expect(
			schemaForm.safeParse({ name: "Schéma 2026", url: "", actionPlanUrls: [] })
				.success,
		).toBe(true);
	});

	it("requires the name", () => {
		const result = schemaForm.safeParse({
			name: "",
			url: "",
			actionPlanUrls: [],
		});
		expect(result.error?.issues[0]?.path).toEqual(["name"]);
	});

	it("validates each action plan entry at its indexed path", () => {
		const result = schemaForm.safeParse({
			name: "Schéma 2026",
			url: "",
			actionPlanUrls: [{ name: "", url: "pas-une-url" }],
		});
		expect(result.error?.issues.map((i) => i.path)).toEqual([
			["actionPlanUrls", 0, "name"],
			["actionPlanUrls", 0, "url"],
		]);
	});
});

describe("schemaDraft (autosave)", () => {
	it("accepts an empty in-progress value", () => {
		expect(schemaDraft.safeParse({}).success).toBe(true);
	});
});

describe("declarationToSchemaValues", () => {
	it("falls back to defaults when the group is absent", () => {
		expect(
			declarationToSchemaValues({
				schema: null,
			} as unknown as PopulatedDeclaration),
		).toEqual(schemaDefaultValues);
	});

	it("coalesces persisted nulls, including inside action plan entries", () => {
		expect(
			declarationToSchemaValues({
				schema: {
					name: "Schéma 2026",
					url: null,
					actionPlanUrls: [{ name: null, url: "https://www.example.fr" }],
				},
			} as unknown as PopulatedDeclaration),
		).toEqual({
			name: "Schéma 2026",
			url: "",
			actionPlanUrls: [{ name: "", url: "https://www.example.fr" }],
		});
	});
});

import { describe, expect, it } from "vitest";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	contact,
	contactDefaultValues,
	contactDraft,
	declarationToContactValues,
} from "~/forms/contact/contactSchema";

const issuesAt = (result: { error?: { issues: { path: unknown[] }[] } }) =>
	result.error?.issues.map((i) => i.path.join(".")) ?? [];

describe("contact (strict)", () => {
	it("passes with a name and one reachable channel", () => {
		expect(
			contact.safeParse({ name: "Référent", email: "a@b.fr", url: "" }).success,
		).toBe(true);
		expect(
			contact.safeParse({
				name: "Référent",
				email: "",
				url: "https://www.example.fr/contact",
			}).success,
		).toBe(true);
	});

	it("requires the name", () => {
		const result = contact.safeParse({ name: "", email: "a@b.fr", url: "" });
		expect(issuesAt(result)).toContain("name");
	});

	it("requires at least one of email or url, flagging both fields", () => {
		const result = contact.safeParse({ name: "Référent", email: "", url: "" });
		expect(issuesAt(result)).toEqual(["email", "url"]);
	});

	it("rejects malformed email and url", () => {
		const result = contact.safeParse({
			name: "Référent",
			email: "pas-un-email",
			url: "pas-une-url",
		});
		expect(issuesAt(result)).toEqual(["url", "email"]);
	});
});

describe("contactDraft (autosave)", () => {
	it("accepts an empty in-progress value", () => {
		expect(contactDraft.safeParse({}).success).toBe(true);
	});

	it("accepts partial values without format rules", () => {
		expect(contactDraft.safeParse({ email: "pas-fini@" }).success).toBe(true);
	});
});

describe("declarationToContactValues", () => {
	it("falls back to defaults when the group is absent", () => {
		expect(
			declarationToContactValues({
				contact: null,
			} as unknown as PopulatedDeclaration),
		).toEqual(contactDefaultValues);
	});

	it("coalesces persisted nulls to empty strings", () => {
		expect(
			declarationToContactValues({
				contact: { name: "Référent", email: null, url: null },
			} as unknown as PopulatedDeclaration),
		).toEqual({ name: "Référent", email: "", url: "" });
	});
});

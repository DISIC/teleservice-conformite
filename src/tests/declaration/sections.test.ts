import { describe, expect, it } from "vitest";
import { completeDeclaration } from "./declaration.fixture";
import {
	DEFAULT_SECTION,
	getPrevNextSections,
	isSectionToComplete,
	parseSectionFromQuery,
	SECTION_SLUGS,
	sectionHref,
} from "~/utils/declaration/sections";

describe("walkthrough navigation", () => {
	it("starts at infos and ends at contact", () => {
		expect(SECTION_SLUGS[0]).toBe("infos");
		expect(SECTION_SLUGS[SECTION_SLUGS.length - 1]).toBe("contact");
	});

	it("has no prev on the first Section and no next on the last", () => {
		expect(getPrevNextSections("infos", SECTION_SLUGS)).toEqual({
			prev: null,
			next: "audit-general",
		});
		expect(getPrevNextSections("contact", SECTION_SLUGS)).toEqual({
			prev: "schema",
			next: null,
		});
	});

	it("returns nowhere for a Section absent from the visible list", () => {
		expect(getPrevNextSections("contact", ["infos", "schema"])).toEqual({
			prev: null,
			next: null,
		});
	});

	it("falls back to the default Section on an unknown query value", () => {
		expect(parseSectionFromQuery("audit-outils")).toBe("audit-outils");
		expect(parseSectionFromQuery("inconnu")).toBe(DEFAULT_SECTION);
		expect(parseSectionFromQuery(undefined)).toBe(DEFAULT_SECTION);
	});

	it("encodes the field to focus into the section href", () => {
		expect(sectionHref(7, "contact", "contact.sourceMode")).toBe(
			"/dashboard/declarations/7?section=contact&field=contact.sourceMode",
		);
	});
});

describe("isSectionToComplete (À compléter badges)", () => {
	it("flags contact until it has a name", () => {
		expect(
			isSectionToComplete(
				completeDeclaration({ contact: {} } as never),
				"contact",
			),
		).toBe(true);
		expect(isSectionToComplete(completeDeclaration(), "contact")).toBe(false);
	});

	it("flags schema until a source mode is chosen", () => {
		expect(
			isSectionToComplete(
				completeDeclaration({ schema: {} } as never),
				"schema",
			),
		).toBe(true);
		expect(isSectionToComplete(completeDeclaration(), "schema")).toBe(false);
	});

	it("flags audit-general until the realisation question is answered", () => {
		expect(
			isSectionToComplete(
				completeDeclaration({ audit: {} } as never),
				"audit-general",
			),
		).toBe(true);
		expect(isSectionToComplete(completeDeclaration(), "audit-general")).toBe(
			false,
		);
	});

	it("keeps realised-only Sub-sections inert while the audit is not realised", () => {
		const notRealised = completeDeclaration({
			audit: { isRealised: false },
		} as never);
		expect(isSectionToComplete(notRealised, "audit-outils")).toBe(false);
		expect(isSectionToComplete(notRealised, "audit-contenus")).toBe(false);
	});

	it("flags an empty realised Sub-section slice", () => {
		const realised = completeDeclaration({
			audit: { isRealised: true },
		} as never);
		expect(isSectionToComplete(realised, "audit-outils")).toBe(true);
		expect(
			isSectionToComplete(
				completeDeclaration({
					audit: { isRealised: true, usedTools: [{ name: "wave" }] },
				} as never),
				"audit-outils",
			),
		).toBe(false);
	});
});

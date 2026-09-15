import { describe, expect, it } from "vitest";
import {
	resolveSectionEditing,
	type SectionEditingInput,
} from "~/domain/declaration/sectionEditing";

const plain = (overrides: Partial<SectionEditingInput> = {}) =>
	resolveSectionEditing({
		mode: "sequential",
		isEditable: true,
		hideActions: false,
		isLast: false,
		library: null,
		...overrides,
	});

const withLibrary = (
	library: Partial<SectionEditingInput["library"]> = {},
	overrides: Partial<SectionEditingInput> = {},
) =>
	plain({
		library: {
			options: ["linked", "custom", "skipped"],
			hasLibraryItems: true,
			effectiveMode: null,
			isLinked: false,
			...library,
		},
		...overrides,
	});

describe("resolveSectionEditing — a Section without a Library", () => {
	it("is a permanently editable, autosaving form while sequential", () => {
		expect(plain()).toMatchObject({
			bodyMode: "custom",
			showRadio: false,
			isCustomEdit: true,
			autosave: true,
			startsReadOnly: false,
			isTerminal: false,
		});
	});

	it("starts read-only and never autosaves once standalone", () => {
		expect(plain({ mode: "standalone" })).toMatchObject({
			autosave: false,
			startsReadOnly: true,
			isTerminal: false,
		});
	});

	it("opens straight in edit when nothing is saved yet", () => {
		expect(
			plain({ mode: "standalone", isEditable: false }).startsReadOnly,
		).toBe(false);
	});

	it("ends the walkthrough with the publish gate on the last Section", () => {
		expect(plain({ isLast: true }).isTerminal).toBe(true);
		expect(plain({ isLast: true, mode: "standalone" }).isTerminal).toBe(false);
	});

	it("neither autosaves nor publishes when there is nothing to save", () => {
		expect(plain({ hideActions: true, isLast: true })).toMatchObject({
			autosave: false,
			isTerminal: false,
		});
	});
});

describe("resolveSectionEditing — a Library-sourced Section", () => {
	it("renders nothing and holds autosave while Undecided", () => {
		expect(withLibrary()).toMatchObject({
			showRadio: true,
			bodyMode: null,
			isCustomEdit: false,
			autosave: false,
		});
	});

	it("autosaves a Custom form", () => {
		expect(withLibrary({ effectiveMode: "custom" })).toMatchObject({
			bodyMode: "custom",
			isCustomEdit: true,
			autosave: true,
		});
	});

	it("never persists a Linked mirror or a Skipped choice from the form", () => {
		expect(
			withLibrary({ effectiveMode: "linked", isLinked: true }),
		).toMatchObject({
			bodyMode: "linked",
			isCustomEdit: false,
			autosave: false,
		});
		expect(withLibrary({ effectiveMode: "skipped" })).toMatchObject({
			bodyMode: "skipped",
			isCustomEdit: false,
			autosave: false,
		});
	});

	it("collapses to a bare autosaving Custom form when the Library is empty", () => {
		expect(
			withLibrary({ hasLibraryItems: false, options: ["linked", "custom"] }),
		).toMatchObject({
			visibleOptions: ["custom"],
			showRadio: false,
			bodyMode: "custom",
			isCustomEdit: true,
			autosave: true,
		});
	});

	it("keeps the radio for schema even without Library items — Skipped remains a choice", () => {
		expect(withLibrary({ hasLibraryItems: false })).toMatchObject({
			visibleOptions: ["custom", "skipped"],
			showRadio: true,
			bodyMode: null,
		});
	});
});

import type { SourceModeValue } from "./sourceMode";
import type { EditingMode } from "./status";

export type SectionLibraryState = {
	/** Radio options the Section offers, in display order. */
	options: readonly SourceModeValue[];
	hasLibraryItems: boolean;
	/** What the radio shows: a pending local choice, else the persisted mode. */
	effectiveMode: SourceModeValue | null;
	isLinked: boolean;
};

export type SectionEditingInput = {
	mode: EditingMode;
	/** Saved data exists to toggle between read-only and edit. */
	isEditable: boolean;
	/** Nothing to save right now (e.g. an audit slice before the audit is realised). */
	hideActions: boolean;
	/** Last Section of the walkthrough. */
	isLast: boolean;
	library: SectionLibraryState | null;
};

export type SectionEditing = {
	/** Which body renders: the form, the read-only Library mirror, the skip notice, or nothing while Undecided. */
	bodyMode: SourceModeValue | null;
	visibleOptions: SourceModeValue[];
	showRadio: boolean;
	/** The rendered content is this Section's own work to persist. */
	isCustomEdit: boolean;
	/** Ends the sequential walkthrough with the publish gate instead of "Suivant". */
	isTerminal: boolean;
	autosave: boolean;
	startsReadOnly: boolean;
};

/** How one Section behaves given the editing mode, its registry flags and its source. */
export function resolveSectionEditing(
	input: SectionEditingInput,
): SectionEditing {
	const isSequential = input.mode === "sequential";
	const { library } = input;

	// With an empty Library the radio collapses to a bare Custom form.
	const visibleOptions = library
		? library.options.filter(
				(option) => option !== "linked" || library.hasLibraryItems,
			)
		: [];
	const showRadio = visibleOptions.length >= 2;
	const bodyMode = library && showRadio ? library.effectiveMode : "custom";
	// Linked content is Library-synced and Skipped has nothing to save.
	const isCustomEdit = !(library?.isLinked ?? false) && bodyMode === "custom";

	return {
		bodyMode,
		visibleOptions,
		showRadio,
		isCustomEdit,
		isTerminal: isSequential && !input.hideActions && input.isLast,
		autosave: isSequential && isCustomEdit && !input.hideActions,
		startsReadOnly: isSequential ? false : input.isEditable,
	};
}

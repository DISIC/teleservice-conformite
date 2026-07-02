import { type AnyFormApi, useStore } from "@tanstack/react-form";
import type { EditingMode } from "~/utils/declaration/status";
import { useAutosave } from "~/utils/declaration/useAutosave";
import { useRevealSectionErrors } from "~/utils/declaration/useRevealSectionErrors";

// A Section form's live behaviour in one wiring point: debounced autosave runs
// in sequential mode only; error reveal on a publish redirect runs in both modes.
export function useLiveSectionForm<TValues>(
	form: AnyFormApi,
	{
		mode,
		save,
		autosaveWhen,
	}: {
		mode: EditingMode;
		save: (values: TValues) => unknown;
		autosaveWhen?: (values: TValues) => boolean;
	},
) {
	const values = useStore(form.store, (state) => state.values as TValues);
	useAutosave({
		enabled: mode === "sequential" && (autosaveWhen?.(values) ?? true),
		values,
		save,
	});
	useRevealSectionErrors(form);
}

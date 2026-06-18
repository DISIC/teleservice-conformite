import { useCallback, useEffect, useRef } from "react";
import { useUnsavedChangesWarning } from "~/utils/declaration/useUnsavedChangesWarning";

type AutosaveForm<TValues> = {
	state: { isDefaultValue: boolean; values: TValues };
};

// Flushes the pending save on unmount and arms the native leave prompt while the
// form still differs from the last saved state (`isDefaultValue` is false).
export function useAutosaveGuard<TValues>({
	enabled,
	form,
	save,
}: {
	enabled: boolean;
	form: AutosaveForm<TValues>;
	save: (values: TValues) => unknown;
}) {
	const flush = useRef(() => {});
	flush.current = () => {
		if (enabled && !form.state.isDefaultValue) save(form.state.values);
	};
	useEffect(() => () => flush.current(), []);

	useUnsavedChangesWarning(
		useCallback(() => enabled && !form.state.isDefaultValue, [enabled, form]),
	);
}

import { useCallback, useEffect, useRef } from "react";
import { AUTOSAVE_DEBOUNCE_MS } from "~/forms/formOptions";
import { useUnsavedChangesWarning } from "~/utils/declaration/useUnsavedChangesWarning";

function valuesEqual(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (
		typeof a !== "object" ||
		typeof b !== "object" ||
		a === null ||
		b === null
	)
		return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
			return false;
		return a.every((item, index) => valuesEqual(item, b[index]));
	}
	const aRecord = a as Record<string, unknown>;
	const bRecord = b as Record<string, unknown>;
	const keys = Object.keys(aRecord);
	if (keys.length !== Object.keys(bRecord).length) return false;
	return keys.every((key) => valuesEqual(aRecord[key], bRecord[key]));
}

// Persists a change a debounce later, snapshotting saved values so "unsaved"
// spans only the keystroke-to-save window; flushes on unmount and warns on leave.
export function useAutosave<TValues>({
	enabled,
	values,
	save,
}: {
	enabled: boolean;
	values: TValues;
	save: (values: TValues) => unknown;
}) {
	const saved = useRef(values);
	const latest = useRef(values);
	latest.current = values;
	const saveRef = useRef(save);
	saveRef.current = save;

	useEffect(() => {
		if (!enabled || valuesEqual(values, saved.current)) return;
		const id = setTimeout(() => {
			saved.current = values;
			saveRef.current(values);
		}, AUTOSAVE_DEBOUNCE_MS);
		return () => clearTimeout(id);
	}, [enabled, values]);

	const flush = useRef(() => {});
	flush.current = () => {
		if (enabled && !valuesEqual(latest.current, saved.current)) {
			saved.current = latest.current;
			saveRef.current(latest.current);
		}
	};
	useEffect(() => () => flush.current(), []);

	useUnsavedChangesWarning(
		useCallback(
			() => enabled && !valuesEqual(latest.current, saved.current),
			[enabled],
		),
	);
}

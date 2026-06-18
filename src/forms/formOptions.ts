import { formOptions, type StandardSchemaV1 } from "@tanstack/react-form";

// Parse-on-submit validation against the section's Zod schema.
export function submitFormOptions<TValues>(
	defaultValues: TValues,
	schema: StandardSchemaV1<TValues, unknown>,
) {
	return formOptions({
		defaultValues,
		validators: {
			onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(schema),
		},
	});
}

// Validates on every change so a field reveals and clears its error live as the
// declarant types; sequential sections persist via debounced autosave, not submit.
export function changeFormOptions<TValues>(
	defaultValues: TValues,
	schema: StandardSchemaV1<TValues, unknown>,
) {
	return formOptions({
		defaultValues,
		validators: {
			onChange: ({ formApi }) => formApi.parseValuesWithSchema(schema),
		},
	});
}

// Coalesces a burst of keystrokes into a single save.
export const AUTOSAVE_DEBOUNCE_MS = 1500;

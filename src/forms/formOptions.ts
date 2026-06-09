import { formOptions, type StandardSchemaV1 } from "@tanstack/react-form";

/**
 * `formOptions` whose submit validator parses the values with `schema`. Every
 * Section form validates the same way (parse-on-submit against its Zod schema),
 * so this collapses that wiring to one line. Forms needing extra validators
 * (e.g. `onChange`) keep writing `formOptions` directly.
 *
 * Lives here rather than in `context.ts` so the Zod schema files — also imported
 * by server routers — stay free of the form-hook's UI field components.
 */
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

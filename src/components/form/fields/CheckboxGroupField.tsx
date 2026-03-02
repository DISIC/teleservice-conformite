import { Checkbox, type CheckboxProps } from "@codegouvfr/react-dsfr/Checkbox";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface CheckboxGroupFieldProps
	extends DefaultFieldProps,
		Omit<CheckboxProps, "state" | "stateRelatedMessage" | "options"> {
	options: (Omit<CheckboxProps["options"][number], "nativeInputProps"> & {
		value: string;
		nativeInputProps?: CheckboxProps["options"][number]["nativeInputProps"];
	})[];
}

export function CheckboxGroupField(props: CheckboxGroupFieldProps) {
	const { readOnlyField, required, ...commonProps } = props;
	const field = useFieldContext<string[]>();
	const valueSet = new Set(field.state.value ?? []);

	if (readOnlyField) {
		const value = field.state.value.join(", ");
		return <ReadOnlyField label={commonProps.legend} value={value} />;
	}

	return (
		<Checkbox
			{...commonProps}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((e) => e.message).join(",") ?? ""
			}
			options={commonProps.options.map((option, index) => ({
				...option,
				nativeInputProps: {
					...option.nativeInputProps,
					name: field.name,
					checked: valueSet.has(option.value),
					onChange: (e) => {
						const checked = e.target.checked;
						const current = field.state.value ?? [];
						if (checked) {
							field.setValue([...current, option.value]);
						} else {
							field.setValue(current.filter((v) => v !== option.value));
						}
					},
					required: required && index === 0 && valueSet.size === 0,
				},
			}))}
		/>
	);
}

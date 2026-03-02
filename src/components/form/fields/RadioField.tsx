import { fr } from "@codegouvfr/react-dsfr";
import {
	RadioButtons,
	type RadioButtonsProps,
} from "@codegouvfr/react-dsfr/RadioButtons";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

type TValue = string | boolean;

interface RadioFieldProps
	extends DefaultFieldProps,
		Omit<RadioButtonsProps, "state" | "stateRelatedMessage" | "options"> {
	options: (Omit<RadioButtonsProps["options"][number], "nativeInputProps"> & {
		value: TValue;
		nativeInputProps?: RadioButtonsProps["options"][number]["nativeInputProps"];
	})[];
	onOptionChange?: (value: TValue) => void;
}

export function RadioField(props: RadioFieldProps) {
	const { readOnlyField, required, onOptionChange, ...commonProps } = props;
	const field = useFieldContext<TValue>();

	if (readOnlyField) {
		const value =
			typeof field.state.value === "boolean"
				? commonProps.options
						.find((option) => option.value === field.state.value)
						?.label?.toString() || ""
				: field.state.value;
		return <ReadOnlyField label={commonProps.legend} value={value} />;
	}

	return (
		<RadioButtons
			{...commonProps}
			{...getFieldState(field.state.meta.errors)}
			name={field.name}
			className={commonProps.className ?? fr.cx("fr-mb-0")}
			options={commonProps.options.map(
				({ value, nativeInputProps, ...option }) => ({
					...option,
					nativeInputProps: {
						...nativeInputProps,
						value: value.toString(),
						checked: field.state.value === value,
						required: nativeInputProps?.required ?? required,
						onChange: () => {
							field.setValue(value);
							onOptionChange?.(value);
						},
					},
				}),
			)}
		/>
	);
}

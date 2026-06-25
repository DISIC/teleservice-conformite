import { fr } from "@codegouvfr/react-dsfr";
import {
	RadioButtons,
	type RadioButtonsProps,
} from "@codegouvfr/react-dsfr/RadioButtons";

import { type DefaultFieldProps, useFieldContext } from "~/forms/context";
import { getFieldState } from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

type RichRadioOption = {
	value: string;
	label: React.ReactNode;
	illustration: React.ReactNode;
	hintText?: React.ReactNode;
	nativeInputProps?: Omit<
		NonNullable<RadioButtonsProps["options"][number]["nativeInputProps"]>,
		"value" | "checked" | "onChange" | "name" | "type"
	>;
};

interface RichRadioFieldProps extends DefaultFieldProps {
	label: React.ReactNode;
	options: RichRadioOption[];
	onOptionChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export function RichRadioField(props: RichRadioFieldProps) {
	const {
		readOnlyField,
		required,
		onOptionChange,
		disabled,
		className,
		label,
		options,
	} = props;
	const field = useFieldContext<string>();

	if (readOnlyField) {
		const selectedOption = options.find((o) => o.value === field.state.value);
		const readOnlyValue =
			typeof selectedOption?.label === "string" ? selectedOption.label : "";
		return <ReadOnlyField label={label} value={readOnlyValue} />;
	}

	return (
		<RadioButtons
			{...getFieldState(field.state.meta)}
			legend={withRequiredMark(label, required)}
			name={field.name}
			disabled={disabled}
			className={className ?? fr.cx("fr-mb-0")}
			options={options.map(
				({ value, label, illustration, hintText, nativeInputProps }) => ({
					label,
					hintText,
					illustration,
					nativeInputProps: {
						...nativeInputProps,
						value,
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

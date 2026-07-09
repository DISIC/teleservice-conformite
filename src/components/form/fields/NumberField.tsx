import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

interface NumberFieldProps
	extends
		DefaultFieldProps,
		Omit<InputProps.Common, "state" | "stateRelatedMessage"> {
	nativeInputProps?: InputProps.RegularInput["nativeInputProps"];
}

export function NumberField(props: NumberFieldProps) {
	const { readOnlyField, required, nativeInputProps, ...commonProps } = props;
	const field = useFieldContext<number | null>();

	if (readOnlyField) {
		return (
			<ReadOnlyField
				label={commonProps.label}
				value={field.state.value != null ? `${field.state.value}` : ""}
			/>
		);
	}

	return (
		<Input
			{...commonProps}
			{...getFieldState(field.state.meta)}
			label={withRequiredMark(commonProps.label, required)}
			nativeInputProps={{
				...nativeInputProps,
				type: "number",
				inputMode: "numeric",
				pattern: "[0-9]*",
				name: field.name,
				value: field.state.value ?? "",
				required: nativeInputProps?.required ?? required,
				// An empty or malformed input reads as NaN, which no schema or store accepts; hold null instead.
				onChange: (e) =>
					field.setValue(
						Number.isNaN(e.target.valueAsNumber)
							? null
							: e.target.valueAsNumber,
					),
			}}
		/>
	);
}

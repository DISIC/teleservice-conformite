import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface NumberFieldProps
	extends DefaultFieldProps,
		Omit<InputProps.Common, "state" | "stateRelatedMessage"> {
	nativeInputProps?: InputProps.RegularInput["nativeInputProps"];
}

export function NumberField(props: NumberFieldProps) {
	const { readOnlyField, required, nativeInputProps, ...commonProps } = props;
	const field = useFieldContext<number>();

	if (readOnlyField) {
		return (
			<ReadOnlyField label={commonProps.label} value={`${field.state.value}`} />
		);
	}

	return (
		<Input
			{...commonProps}
			nativeInputProps={{
				...nativeInputProps,
				type: "number",
				inputMode: "numeric",
				pattern: "[0-9]*",
				name: field.name,
				value: field.state.value,
				required: nativeInputProps?.required ?? required,
				onChange: (e) => field.setValue(e.target.valueAsNumber),
			}}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ??
				commonProps
			}
		/>
	);
}

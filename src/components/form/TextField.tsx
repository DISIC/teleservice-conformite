import { Input } from "@codegouvfr/react-dsfr/Input";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

type TextFieldProps = {
	kind?: string;
};

export function TextField({
	label,
	disabled,
	kind,
}: DefaultFieldProps & TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Input
			label={label}
			nativeInputProps={{
				type: kind ?? "text",
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.value),
			}}
			disabled={disabled}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
		/>
	);
}

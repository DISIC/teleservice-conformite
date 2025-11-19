import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { HTMLInputTypeAttribute } from "react";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

type TextFieldProps = {
	kind?: Exclude<HTMLInputTypeAttribute, "text">;
};

export function TextField({
	label,
	disabled,
	className,
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
			className={className}
		/>
	);
}

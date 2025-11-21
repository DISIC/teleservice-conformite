import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { HTMLInputTypeAttribute } from "react";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface TextFieldProps extends DefaultFieldProps {
	kind?: Exclude<HTMLInputTypeAttribute, "text" | "date">;
	min?: string;
	max?: string;
}

export function TextField(props: TextFieldProps) {
	const { label, disabled, className, kind } = props;
	const field = useFieldContext<string>();

	return (
		<Input
			label={label}
			nativeInputProps={{
				type: kind ?? "text",
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.value),
				min: kind === "date" && props.min ? props.min : undefined,
				max: kind === "date" && props.max ? props.max : undefined,
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

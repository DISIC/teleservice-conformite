import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { HTMLInputTypeAttribute } from "react";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface TextFieldProps extends DefaultFieldProps {
	kind?: Exclude<HTMLInputTypeAttribute, "text" | "date">;
	min?: string;
	max?: string;
	readOnly?: boolean;
	description?: string;
	placeholder?: string;
}

export function TextField(props: TextFieldProps) {
	const {
		label,
		description,
		placeholder,
		disabled,
		className,
		kind,
		readOnly = false,
	} = props;
	const field = useFieldContext<string>();

	return !readOnly ? (
		<Input
			label={label}
			hintText={description}
			nativeInputProps={{
				type: kind ?? "text",
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.value),
				min: kind === "date" && props.min ? props.min : undefined,
				max: kind === "date" && props.max ? props.max : undefined,
				placeholder: placeholder,
			}}
			disabled={disabled}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
			className={className}
		/>
	) : (
		<div>
			<p>
				<strong>{label}</strong>: {field.state.value}
			</p>
		</div>
	);
}

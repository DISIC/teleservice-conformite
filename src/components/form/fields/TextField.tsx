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
	textArea?: boolean;
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
		textArea = false,
	} = props;
	const field = useFieldContext<string>();
	const state: "error" | "success" | "info" | "default" =
		field.state.meta.errors.length > 0 ? "error" : "default";
	const commonState = {
		state,
		stateRelatedMessage:
			field.state.meta.errors.map((e) => e.message).join(",") ?? "",
		className,
		label,
		hintText: description,
		disabled,
	};

	return !readOnly ? (
		textArea ? (
			<Input
				{...commonState}
				textArea={true}
				nativeTextAreaProps={{
					name: field.name,
					value: field.state.value,
					onChange: (e) => field.setValue(e.target.value),
					placeholder,
				}}
			/>
		) : (
			<Input
				{...commonState}
				nativeInputProps={{
					type: kind ?? "text",
					name: field.name,
					value: field.state.value,
					onChange: (e) => field.setValue(e.target.value),
					min: kind === "date" && props.min ? props.min : undefined,
					max: kind === "date" && props.max ? props.max : undefined,
					placeholder,
				}}
			/>
		)
	) : (
		<div>
			<p style={{ margin: 0 }}>
				<strong>{label}</strong> {field.state.value}
			</p>
		</div>
	);
}

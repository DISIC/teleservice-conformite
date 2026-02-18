import { Input } from "@codegouvfr/react-dsfr/Input";
import type { HTMLInputTypeAttribute } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface TextFieldProps extends DefaultFieldProps {
	kind?: Exclude<HTMLInputTypeAttribute, "text" | "date">;
	min?: string;
	max?: string;
	textArea?: boolean;
	inputReadOnly?: boolean;
}

export function TextField({
	label,
	description,
	placeholder,
	disabled,
	className,
	kind,
	readOnly = false,
	required,
	textArea = false,
	inputReadOnly,
	min,
	max,
}: TextFieldProps) {
	const { classes } = useStyles();
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

	if (readOnly) {
		return (
			<ReadOnlyField
				label={label}
				value={String(field.state.value)}
				textArea={textArea}
			/>
		);
	}

	return (
		<div className={classes.inputWrapper}>
			{textArea ? (
				<Input
					{...commonState}
					textArea={true}
					nativeTextAreaProps={{
						name: field.name,
						value: field.state.value,
						onChange: (e) => field.setValue(e.target.value),
						placeholder,
						readOnly: inputReadOnly,
						required,
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
						min: kind === "date" && min ? min : undefined,
						max: kind === "date" && max ? max : undefined,
						placeholder,
						readOnly: inputReadOnly,
						required,
					}}
				/>
			)}
		</div>
	);
}

const useStyles = tss.withName(TextField.name).create({
	inputWrapper: {
		marginBottom: fr.spacing("4w"),

		"& label:has(+ input[readonly])": {
			color: fr.colors.decisions.text.disabled.grey.default,
		},

		"& input[readonly], & textarea[readonly]": {
			backgroundColor: fr.colors.decisions.background.disabled.grey.default,
			boxShadow: "none",
		},
	},
});

import { fr } from "@codegouvfr/react-dsfr";
import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";
import type { InputHTMLAttributes } from "react";
import { tss } from "tss-react";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface TextFieldProps
	extends DefaultFieldProps,
		Omit<InputProps.Common, "state" | "stateRelatedMessage"> {
	textArea?: boolean;
	nativeInputProps?: InputProps.RegularInput["nativeInputProps"];
	nativeTextAreaProps?: InputProps.TextArea["nativeTextAreaProps"];
}

export function TextField(props: TextFieldProps) {
	const {
		readOnlyField,
		required,
		textArea,
		nativeInputProps,
		nativeTextAreaProps,
		...commonProps
	} = props;
	const field = useFieldContext<string>();
	const { classes } = useStyles();

	if (readOnlyField) {
		return (
			<ReadOnlyField
				label={commonProps.label}
				value={String(field.state.value)}
				textArea={textArea}
			/>
		);
	}

	const customNativeProps: InputHTMLAttributes<
		HTMLInputElement | HTMLTextAreaElement
	> = {
		name: field.name,
		value: field.state.value,
		onChange: (e) => field.setValue(e.target.value),
	};

	return (
		<div className={classes.inputWrapper}>
			{textArea ? (
				<Input
					{...commonProps}
					{...getFieldState(field.state.meta.errors)}
					textArea={textArea}
					nativeTextAreaProps={{
						...nativeTextAreaProps,
						required: nativeTextAreaProps?.required ?? required,
						...customNativeProps,
					}}
				/>
			) : (
				<Input
					{...commonProps}
					{...getFieldState(field.state.meta.errors)}
					nativeInputProps={{
						...nativeInputProps,
						required: nativeInputProps?.required ?? required,
						...customNativeProps,
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

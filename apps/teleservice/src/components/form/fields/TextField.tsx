import { fr } from "@codegouvfr/react-dsfr";
import { Input, type InputProps } from "@codegouvfr/react-dsfr/Input";
import {
	type InputHTMLAttributes,
	useCallback,
	useLayoutEffect,
	useRef,
} from "react";
import { tss } from "tss-react";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

// Grows with its content, never below its `rows`, so no text hides behind a scrollbar.
function fitToContent(textArea: HTMLTextAreaElement) {
	// A textarea laid out while hidden has no width to measure; it is fitted once shown.
	if (!textArea.clientWidth) return;
	textArea.style.height = "auto";
	const borders = textArea.offsetHeight - textArea.clientHeight;
	textArea.style.height = `${textArea.scrollHeight + borders}px`;
}

interface TextFieldProps
	extends
		DefaultFieldProps,
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
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const callerRef = nativeTextAreaProps?.ref;

	useLayoutEffect(() => {
		if (textAreaRef.current) fitToContent(textAreaRef.current);
	}, [field.state.value]);

	// A new width re-wraps the text (resize, zoom, rotation) and showing a hidden textarea gives it one.
	const attachTextArea = useCallback(
		(textArea: HTMLTextAreaElement) => {
			textAreaRef.current = textArea;
			if (typeof callerRef === "function") callerRef(textArea);
			else if (callerRef) callerRef.current = textArea;

			let width = textArea.clientWidth;
			fitToContent(textArea);
			const observer = new ResizeObserver(() => {
				if (textArea.clientWidth === width) return;
				width = textArea.clientWidth;
				fitToContent(textArea);
			});
			observer.observe(textArea);

			return () => {
				observer.disconnect();
				textAreaRef.current = null;
				if (typeof callerRef === "function") callerRef(null);
				else if (callerRef) callerRef.current = null;
			};
		},
		[callerRef],
	);

	if (readOnlyField) {
		let value: string | string[] = field.state.value || "";

		if (field.name == "compliantElements") {
			value = value.split("\n").filter((line) => line.trim() !== "");
		}

		return (
			<ReadOnlyField
				label={commonProps.label}
				value={value}
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
					label={withRequiredMark(commonProps.label, required)}
					{...getFieldState(field.state.meta)}
					textArea={textArea}
					nativeTextAreaProps={{
						rows: 3,
						...nativeTextAreaProps,
						ref: attachTextArea,
						required: nativeTextAreaProps?.required ?? required,
						...customNativeProps,
					}}
				/>
			) : (
				<Input
					{...commonProps}
					label={withRequiredMark(commonProps.label, required)}
					{...getFieldState(field.state.meta)}
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
		"&:not(:last-child)": {
			marginBottom: fr.spacing("4w"),
		},
		"& label:has(+ input[readonly])": {
			color: fr.colors.decisions.text.disabled.grey.default,
		},
		"& input[readonly], & textarea[readonly]": {
			backgroundColor: fr.colors.decisions.background.disabled.grey.default,
			boxShadow: "none",
		},
	},
});

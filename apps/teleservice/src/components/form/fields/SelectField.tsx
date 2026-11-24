import { Select } from "@codegouvfr/react-dsfr/Select";
import type { ReactNode } from "react";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

interface SelectFieldProps extends DefaultFieldProps {
	label: ReactNode;
	hint?: ReactNode;
	placeholder?: string;
	options: readonly { value: string; label: string }[];
	className?: string;
}

export function SelectField(props: SelectFieldProps) {
	const {
		readOnlyField,
		required,
		infoStateMessage,
		label,
		hint,
		placeholder,
		options,
		className,
	} = props;
	const field = useFieldContext<string>();

	if (readOnlyField) {
		const value = String(
			options.find((option) => option.value === field.state.value)?.label ?? "",
		);
		return <ReadOnlyField label={label} value={value} />;
	}

	return (
		<Select
			label={withRequiredMark(label, required)}
			hint={hint}
			nativeSelectProps={{
				name: field.name,
				value: field.state.value ?? "",
				onChange: (e) => field.setValue(e.target.value),
				required,
			}}
			{...getFieldState(field.state.meta, infoStateMessage)}
			className={className}
		>
			<option value="" disabled>
				{placeholder ?? "Sélectionner une option"}
			</option>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</Select>
	);
}

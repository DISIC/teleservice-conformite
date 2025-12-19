import { fr } from "@codegouvfr/react-dsfr";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface SelectFieldProps extends DefaultFieldProps {
	options: Array<{
		label: string;
		value: string;
	}>;
	readOnly?: boolean;
	placeholder?: string;
	defaultStateMessage?: string;
}

export function SelectField({
	label,
	placeholder,
	options,
	disabled,
	className,
	readOnly = false,
	defaultStateMessage = "",
}: SelectFieldProps) {
	const field = useFieldContext<string>();

	return !readOnly ? (
		<Select
			label={label}
			nativeSelectProps={{
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.value),
			}}
			options={options}
			disabled={disabled}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ??
				defaultStateMessage
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

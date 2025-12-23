import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface CheckboxGroupFieldProps extends DefaultFieldProps {
	options: Array<{ label: string; value: string }>;
}

export function CheckboxGroupField({
	label,
	options,
	className,
	disabled,
}: CheckboxGroupFieldProps) {
	const field = useFieldContext<string[]>();

	const valueSet = new Set(field.state.value ?? []);

	return (
		<Checkbox
			legend={label}
			className={className}
			disabled={disabled}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((e) => e.message).join(",") ?? ""
			}
			options={options.map((opt) => ({
				label: opt.label,
				nativeInputProps: {
					name: field.name,
					checked: valueSet.has(opt.value),
					onChange: (e) => {
						const checked = e.target.checked;
						const current = field.state.value ?? [];
						if (checked) {
							if (!current.includes(opt.value))
								field.setValue([...current, opt.value]);
						} else {
							field.setValue(current.filter((v) => v !== opt.value));
						}
					},
					value: opt.value,
				},
			}))}
		/>
	);
}

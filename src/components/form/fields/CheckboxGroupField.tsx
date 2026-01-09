import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface CheckboxGroupFieldProps extends DefaultFieldProps {
	options: Array<{ label: string; value: string }>;
}

export function CheckboxGroupField({
	label,
	description,
	options,
	className,
	disabled,
	readOnly = false,
}: CheckboxGroupFieldProps) {
	const field = useFieldContext<string[]>();
	const valueSet = new Set(field.state.value ?? []);
	const [checkedValues, setCheckedValues] = useState<string[]>(
		field.state.value ?? [],
	);
	const [otherLabel, setOtherLabel] = useState<string>("");

	return !readOnly ? (
		<div>
			<Checkbox
				legend={label}
				hintText={description}
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
								if (!current.includes(opt.value)) {
									field.setValue([...current, opt.value]);
									setCheckedValues([...current, opt.value]);
								}
							} else {
								field.setValue(current.filter((v) => v !== opt.value));
								setCheckedValues(current.filter((v) => v !== opt.value));
							}
						},
						value: opt.value,
					},
				}))}
			/>
			{checkedValues.includes("other") && (
				<Input
					label=""
					nativeInputProps={{
						type: "text",
						name: "other",
						value: otherLabel,
						onChange: (e) => setOtherLabel(e.target.value),
						onBlur: () => field.setValue([...field.state.value, otherLabel]),
						placeholder: "Autre",
					}}
				/>
			)}
		</div>
	) : (
		<ReadOnlyField
			label={label}
			value={options
				.filter((opt) => valueSet.has(opt.value))
				.map((opt) => opt.label)}
		/>
	);
}

import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";
import { set } from "zod";

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
	const [hasOtherOption, setHasOtherOption] = useState<boolean>(false);
	const [otherLabel, setOtherLabel] = useState<string>("");

	const onBlur = () => {
		if (otherLabel) {
			field.setValue([
				...field.state.value.filter((v) => v !== "other"),
				otherLabel,
			]);
			setHasOtherOption(false);
			setOtherLabel("");
		}
	};

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
						checked:
							valueSet.has(opt.value) ||
							(opt.value === "other" && hasOtherOption),
						onChange: (e) => {
							const checked = e.target.checked;
							const current = field.state.value ?? [];
							if (checked) {
								if (!current.includes(opt.value)) {
									if (opt.value === "other") {
										setHasOtherOption(true);
										return;
									}

									field.setValue([...current, opt.value]);
								}
							} else {
								if (opt.value === "other") {
									setHasOtherOption(false);
									return;
								}

								field.setValue(current.filter((v) => v !== opt.value));
							}
						},
						value: opt.value,
					},
				}))}
			/>
			{hasOtherOption && (
				<Input
					label=""
					nativeInputProps={{
						type: "text",
						name: "other",
						value: otherLabel,
						onChange: (e) => setOtherLabel(e.target.value),
						onBlur,
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

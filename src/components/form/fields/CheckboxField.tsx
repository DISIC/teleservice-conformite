import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox, type CheckboxProps } from "@codegouvfr/react-dsfr/Checkbox";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

type TValue = string | boolean;

interface CheckboxFieldProps
	extends DefaultFieldProps,
		Omit<CheckboxProps, "state" | "stateRelatedMessage" | "options"> {
	options: (Omit<CheckboxProps["options"][number], "nativeInputProps"> & {
		value: TValue;
		nativeInputProps?: CheckboxProps["options"][number]["nativeInputProps"];
	})[];
}

export function CheckboxField(props: CheckboxFieldProps) {
	const { readOnlyField, required, ...commonProps } = props;
	const field = useFieldContext<TValue>();

	return (
		<Checkbox
			{...commonProps}
			options={commonProps.options.map(({ value, ...option }) => ({
				...option,
				nativeInputProps: {
					...option.nativeInputProps,
					value: value.toString(),
					name: field.name,
					checked: field.state.value === value,
					onChange: (e) =>
						field.setValue(
							e.target.checked ? value : (undefined as unknown as TValue),
						),
					required: option.nativeInputProps?.required ?? required,
				},
			}))}
			className={commonProps.className ?? fr.cx("fr-mb-0")}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
		/>
	);
}

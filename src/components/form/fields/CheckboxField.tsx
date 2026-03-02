import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox, type CheckboxProps } from "@codegouvfr/react-dsfr/Checkbox";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/utils/form/context";

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
			{...getFieldState(field.state.meta.errors)}
			className={commonProps.className ?? fr.cx("fr-mb-0")}
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
		/>
	);
}

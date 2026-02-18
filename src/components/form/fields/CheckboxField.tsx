import { fr } from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface CheckboxFieldProps extends DefaultFieldProps {}

export function CheckboxField({
	label,
	className,
	disabled,
	description,
	required,
}: CheckboxFieldProps) {
	const field = useFieldContext<boolean>();

	return (
		<Checkbox
			options={[
				{
					label,
					hintText: description,
					nativeInputProps: {
						name: field.name,
						checked: field.state.value,
						onChange: (e) => field.setValue(e.target.checked),
						disabled,
						required,
					},
				},
			]}
			className={className ?? fr.cx("fr-mb-0")}
			style={{ userSelect: "none" }}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
		/>
	);
}

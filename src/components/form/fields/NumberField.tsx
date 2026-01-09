import { Input } from "@codegouvfr/react-dsfr/Input";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface NumberFieldProps extends DefaultFieldProps {
	min?: number;
	max?: number;
}

export function NumberField({ label, readOnly = false }: NumberFieldProps) {
	const field = useFieldContext<number>();

	return !readOnly ? (
		<Input
			label={label}
			nativeInputProps={{
				type: "number",
				inputMode: "numeric",
				pattern: "[0-9]*",
				min: 0,
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.valueAsNumber),
			}}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
		/>
	) : (
		<ReadOnlyField label={label} value={`${field.state.value}`} />
	);
}

import { Upload } from "@codegouvfr/react-dsfr/Upload";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

export function UploadField(props: DefaultFieldProps) {
	const { readOnly, label, description, disabled, className } = props;
	const field = useFieldContext<File | undefined>();

	return !readOnly ? (
		<Upload
			label={label}
			hint={description}
			disabled={disabled}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
			className={className}
			nativeInputProps={{
				name: field.name,
				onChange: (e) =>
					field.setValue(e.currentTarget.files?.[0] ?? undefined),
			}}
		/>
	) : (
		<ReadOnlyField
			label={label}
			value={field.state.value?.name ?? ""}
			placeholder="Aucun fichier sélectionné"
		/>
	);
}

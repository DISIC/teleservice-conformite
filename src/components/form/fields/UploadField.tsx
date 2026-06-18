import { Upload, type UploadProps } from "@codegouvfr/react-dsfr/Upload";
import { type DefaultFieldProps, useFieldContext } from "~/forms/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface UploadFieldProps extends DefaultFieldProps, UploadProps {}

export function UploadField(props: UploadFieldProps) {
	const { readOnlyField, required, ...commonProps } = props;
	const field = useFieldContext<File | undefined>();
	// Surface errors only once the field is touched (or marked by a submit).
	const errors = field.state.meta.isTouched ? field.state.meta.errors : [];

	if (readOnlyField) {
		return (
			<ReadOnlyField
				label={commonProps.label}
				value={field.state.value?.name ?? ""}
				placeholder="Aucun fichier sélectionné"
			/>
		);
	}

	return (
		<Upload
			{...commonProps}
			state={errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={errors.map((error) => error.message).join(", ")}
			nativeInputProps={{
				name: field.name,
				onChange: (e) =>
					field.setValue(e.currentTarget.files?.[0] ?? undefined),
				required,
			}}
		/>
	);
}

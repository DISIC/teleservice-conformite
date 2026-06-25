import { Upload, type UploadProps } from "@codegouvfr/react-dsfr/Upload";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

interface UploadFieldProps extends DefaultFieldProps, UploadProps {}

export function UploadField(props: UploadFieldProps) {
	const { readOnlyField, required, ...commonProps } = props;
	const field = useFieldContext<File | undefined>();

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
			label={withRequiredMark(commonProps.label, required)}
			{...getFieldState(field.state.meta)}
			nativeInputProps={{
				name: field.name,
				onChange: (e) =>
					field.setValue(e.currentTarget.files?.[0] ?? undefined),
				required,
			}}
		/>
	);
}

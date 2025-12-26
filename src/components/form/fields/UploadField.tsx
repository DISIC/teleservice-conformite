import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface UploadFieldProps extends DefaultFieldProps {
	description?: string;
}

export function UploadField(props: UploadFieldProps) {
	const { label, description, disabled, className } = props;
	const field = useFieldContext<File | undefined>();

	return (
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
	);
}

import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { HTMLInputTypeAttribute } from "react";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { Upload } from "@codegouvfr/react-dsfr/Upload";

interface UploadFieldProps extends DefaultFieldProps {
	description?: string;
}

export function UploadField(props: UploadFieldProps) {
	const { label, description, disabled, className } = props;
	const field = useFieldContext<string>();

	return (
		<Upload
			label={label}
			hint={description}
			state={field.state.meta.errors.length > 0 ? "error" : "default"}
			stateRelatedMessage={
				field.state.meta.errors.map((error) => error.message).join(",") ?? ""
			}
			className={className}
			nativeInputProps={{
				name: field.name,
				value: field.state.value,
				onChange: (e) => field.setValue(e.target.value),
			}}
		/>
	);
}

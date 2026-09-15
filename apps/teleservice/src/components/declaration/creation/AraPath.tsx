import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useState } from "react";
import { z } from "zod";
import DeclarationLoader from "~/components/declaration/DeclarationLoader";
import { useAppForm } from "~/forms/context";
import { submitFormOptions } from "~/forms/formOptions";
import { api } from "~/lib/api";
import { Actions } from "./Actions";
import { fr } from "@codegouvfr/react-dsfr";

const araSchema = z.object({
	araUrl: z
		.string()
		.trim()
		.min(1, { message: "L'URL de l'audit Ara est requise" }),
});

const defaultValues: z.infer<typeof araSchema> = { araUrl: "" };

/**
 * ARA import: the user pastes the URL of an audit hosted on ara.numerique.gouv.fr.
 * The server fetches the structured report and maps it onto a new declaration.
 */
export function AraPath({
	onCreated,
}: {
	onCreated: (declarationId: number) => void;
}) {
	const [hasFailed, setHasFailed] = useState(false);

	const { mutateAsync, isPending } = api.declaration.createFromAra.useMutation({
		onSuccess: (result) => onCreated(result.data),
		onError: () => setHasFailed(true),
	});

	const form = useAppForm({
		...submitFormOptions(defaultValues, araSchema),
		onSubmit: async ({ value }) => {
			setHasFailed(false);
			// Service failure surfaces through the mutation's onError (the Alert
			// below); swallow the rejection so the form isn't left "submitting".
			await mutateAsync({ araUrl: value.araUrl.trim() }).catch(() => {});
		},
	});

	if (isPending) return <DeclarationLoader duration={2000} />;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{hasFailed && (
				<Alert
					severity="error"
					title="Impossible de récupérer les données de l'audit Ara"
					description="Vérifiez l'URL et réessayez, ou créez la déclaration manuellement."
					small
					className={fr.cx("fr-mb-6v")}
				/>
			)}
			<form.AppField name="araUrl">
				{(field) => (
					<field.TextField
						label="URL de l’audit Ara"
						hintText="Format attendu : https://ara.numerique.gouv.fr/declaration/xxxxxxx"
						nativeInputProps={{ type: "url" }}
						required
					/>
				)}
			</form.AppField>
			<Actions onContinue={form.handleSubmit} />
		</form>
	);
}

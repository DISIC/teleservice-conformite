import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useState } from "react";
import { z } from "zod";
import DeclarationLoader from "~/components/declaration/DeclarationLoader";
import { useAppForm } from "~/forms/context";
import { submitFormOptions } from "~/forms/formOptions";
import { api } from "~/lib/api";
import { Actions } from "./Actions";

const aiSchema = z.object({
	url: z.url({ message: "Lien invalide (ex: https://www.example.fr)" }),
});

const defaultValues: z.infer<typeof aiSchema> = { url: "" };

/**
 * AI import: the user pastes the public URL of a declaration they host. A
 * sovereign LLM (Albert) parses the page and the server maps the result onto a
 * new declaration. Extracted data is flagged "to verify" for the user to review.
 */
export function AiPath({
	onCreated,
}: {
	onCreated: (declarationId: number) => void;
}) {
	const [hasFailed, setHasFailed] = useState(false);

	const { mutateAsync, isPending } =
		api.declaration.createFromUrlAnalysis.useMutation({
			onSuccess: (result) => onCreated(result.data),
			onError: () => setHasFailed(true),
		});

	const form = useAppForm({
		...submitFormOptions(defaultValues, aiSchema),
		onSubmit: async ({ value }) => {
			setHasFailed(false);
			// Service failure surfaces through the mutation's onError (the Alert
			// below); swallow the rejection so the form isn't left "submitting".
			await mutateAsync({ url: value.url.trim() }).catch(() => {});
		},
	});

	if (isPending) return <DeclarationLoader duration={15000} />;

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
					title="Impossible d'analyser la déclaration en ligne"
					description="Vérifiez l'URL et réessayez, ou créez la déclaration manuellement."
					small
				/>
			)}
			<form.AppField name="url">
				{(field) => (
					<field.TextField
						label="Lien URL de la déclaration en ligne"
						hintText="Format attendu : https://www.example.fr"
						nativeInputProps={{ type: "url" }}
						required
					/>
				)}
			</form.AppField>
			<Actions onContinue={form.handleSubmit} />
		</form>
	);
}

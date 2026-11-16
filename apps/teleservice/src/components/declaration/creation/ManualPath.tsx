import { z } from "zod";
import { useAppForm } from "~/forms/context";
import { submitFormOptions } from "~/forms/formOptions";
import { api } from "~/lib/api";
import { handleFormSubmit } from "~/components/form/handleFormSubmit";
import { Actions } from "./Actions";

const manualSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Le nom du service numérique est requis" }),
});

const defaultValues: z.infer<typeof manualSchema> = { name: "" };

/**
 * Manual creation: the user only provides a name; everything else is filled in
 * later through the declaration editor. Creates the declaration immediately.
 */
export function ManualPath({
	onCreated,
}: {
	onCreated: (declarationId: number) => void;
}) {
	const { mutateAsync, isPending } = api.declaration.createManual.useMutation({
		onSuccess: (result) => onCreated(result.data),
	});

	const form = useAppForm({
		...submitFormOptions(defaultValues, manualSchema),
		onSubmit: async ({ value }) => {
			await mutateAsync({ name: value.name.trim() });
		},
	});

	return (
		<form onSubmit={handleFormSubmit(form)} noValidate>
			<form.AppField name="name">
				{(field) => (
					<field.TextField
						label="Nom du service numérique concerné"
						hintText={
							<>
								Il sera utilisé pour nommer votre déclaration.
								<br />
								Exemples : Demande de logement social, Service public.fr, Outil
								de gestion des congés
							</>
						}
						required
					/>
				)}
			</form.AppField>
			<Actions disabled={isPending} />
		</form>
	);
}

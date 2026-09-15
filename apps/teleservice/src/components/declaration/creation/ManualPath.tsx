import { z } from "zod";
import { useAppForm } from "~/forms/context";
import { submitFormOptions } from "~/forms/formOptions";
import { api } from "~/lib/api";
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
	entityId,
	onCreated,
}: {
	entityId?: number;
	onCreated: (declarationId: number) => void;
}) {
	const { mutateAsync, isPending } = api.declaration.createManual.useMutation({
		onSuccess: (result) => onCreated(result.data),
	});

	const form = useAppForm({
		...submitFormOptions(defaultValues, manualSchema),
		onSubmit: async ({ value }) => {
			await mutateAsync({ name: value.name.trim(), entityId });
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppField name="name">
				{(field) => (
					<field.TextField
						label="Nom du service numérique concerné"
						hintText={
							<>
								Nous vous conseillons d’utiliser le nom du service numérique.
								<br />
								Exemples : Demande de logement social, Service public.fr, Outil
								de gestion des congés
							</>
						}
						required
					/>
				)}
			</form.AppField>
			<Actions onContinue={form.handleSubmit} disabled={isPending} />
		</form>
	);
}

import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useStore } from "@tanstack/react-form";
import { useEffect, useId, useState } from "react";
import { tss } from "tss-react";
import z from "zod";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";

export type UpdateAuditFromAraModalActions = {
	open?: () => void;
};

export type AraFetchedData = NonNullable<
	Awaited<
		ReturnType<
			ReturnType<
				typeof api.declaration.getInfoFromAra.useMutation
			>["mutateAsync"]
		>
	>
>["data"];

const updateAuditFromAraFormSchema = z.object({
	araUrl: z.string().min(1, { message: "L'URL de l'audit Ara est requise" }),
});

type UpdateAuditFromAraForm = z.infer<typeof updateAuditFromAraFormSchema>;

interface UpdateAuditFromAraModalProps {
	onAraDataFetched: (data: AraFetchedData) => void;
	actions: UpdateAuditFromAraModalActions;
}

export function UpdateAuditFromAraModal({
	onAraDataFetched,
	actions,
}: UpdateAuditFromAraModalProps) {
	const { classes } = useStyles();
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `updateAuditFromAraModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const {
		mutateAsync: getInfoFromAra,
		isPending,
		isError,
	} = api.declaration.getInfoFromAra.useMutation();

	const form = useAppForm({
		defaultValues: { araUrl: "" } as UpdateAuditFromAraForm,
		validators: { onSubmit: updateAuditFromAraFormSchema },
		onSubmit: async ({ value }) => {
			const araId = value.araUrl.slice(value.araUrl.lastIndexOf("/") + 1);
			const result = await getInfoFromAra({ id: araId });
			if (result?.data) {
				onAraDataFetched(result.data);
				modal.close();
				form.reset();
			}
		},
	});

	const canSubmit = useStore(
		form.store,
		(state) => state.isValid && !state.isPristine,
	);

	useEffect(() => {
		actions.open = () => {
			form.reset();
			modal.open();
		};
	}, []);

	useIsModalOpen(modal, {
		onConceal: () => {
			form.reset();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			onInvalid={() => form.validate("submit")}
		>
			<modal.Component
				buttons={[
					{ children: "Annuler", type: "button", disabled: isPending },
					{
						children: "Mettre à jour les informations",
						type: "submit",
						doClosesModal: false,
						disabled: isPending || !canSubmit,
					},
				]}
				title="Mettre à jour depuis Ara"
			>
				<section id="modal-header" className={classes.modalHeader}>
					{(isPending || isError) && (
						<Alert
							small
							severity={isError ? "error" : "info"}
							description={
								isError
									? "Une erreur est survenue dans l’import. Nous vous invitons a réessayer."
									: "Importation en cours, cela peut prendre quelques secondes"
							}
						/>
					)}
					<p className={classes.modalSubheading}>
						<strong>L’intégralité des informations</strong> d’audit, de contact
						et de plans d’action <strong>seront mises à jour</strong>.
					</p>
				</section>
				<form.AppField name="araUrl">
					{(field) => (
						<field.TextField
							label="Lien URL de la déclaration Ara (obligatoire)"
							hintText="Format attendu : https://ara.numerique.gouv.fr/declaration/xxxxxxx"
							nativeInputProps={{ type: "url" }}
							required
						/>
					)}
				</form.AppField>
			</modal.Component>
		</form>
	);
}

const useStyles = tss.withName("UpdateAuditFromAraModal").create({
	modalHeader: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
	modalHeading: {
		fontSize: "1.5rem",
		lineHeight: "2rem",
		marginBottom: 0,
	},
	modalSubheading: {
		fontWeight: 400,
	},
});

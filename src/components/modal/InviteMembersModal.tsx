import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Information from "@codegouvfr/react-dsfr/picto/Information";
import { TRPCClientError } from "@trpc/client";
import { useEffect, useId, useState } from "react";
import { tss } from "tss-react";
import z from "zod";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import HelpingMessage from "../declaration/HelpingMessage";

export type InviteMembersModalActions = {
	open?: () => void;
};

const inviteMemberFormSchema = z.object({
	email: z.email("Adresse e-mail invalide"),
});

interface InviteMembersModalProps {
	declarationId: number;
	actions: InviteMembersModalActions;
}

export default function InviteMembersModal({
	declarationId,
	actions,
}: InviteMembersModalProps) {
	const { classes } = useStyles();
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `inviteMembersModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const apiUtils = api.useUtils();

	const { mutateAsync: createAccessRight } = api.accessRight.create.useMutation(
		{
			onSuccess: () =>
				apiUtils.accessRight.getByDeclarationId.invalidate({
					id: declarationId,
				}),
		},
	);

	const form = useAppForm({
		defaultValues: { email: "" } as z.infer<typeof inviteMemberFormSchema>,
		validators: { onSubmit: inviteMemberFormSchema },
		onSubmit: async ({ value, formApi }) => {
			try {
				await createAccessRight({
					declarationId,
					email: value.email,
					role: "admin",
				});
				modal.close();
				form.reset();
			} catch (e) {
				if (e instanceof TRPCClientError && e.data?.code === "CONFLICT") {
					formApi.fieldInfo.email.instance?.setErrorMap({
						onSubmit: { message: e.message },
					});
				}
			}
		},
	});

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
		>
			<modal.Component
				buttons={[
					{ children: "Annuler", type: "button" },
					{ children: "Inviter", type: "submit", doClosesModal: false },
				]}
				size="large"
				title={
					<section id="modal-header" className={classes.modalHeader}>
						<h1 className={classes.modalHeading}>Inviter un membre</h1>
						<p className={classes.modalSubheading}>
							Tous les champs sont obligatoires
						</p>
					</section>
				}
			>
				<div className={classes.helpingMessageContainer}>
					<HelpingMessage
						image={<Information fontSize="5rem" />}
						message={
							<span>
								Seuls les <strong>membres de votre organisation</strong> peuvent
								être invité sur cette déclaration.
								<br />
								Une fois invité, ils pourront{" "}
								<strong>modifier tous les éléments</strong> de la déclaration.
							</span>
						}
					/>
				</div>
				<form.AppField name="email">
					{(field) => (
						<field.TextField
							hintText="Format attendu : nom@domaine.fr"
							label="Adresse e-mail"
							{...field}
						/>
					)}
				</form.AppField>
			</modal.Component>
		</form>
	);
}

const useStyles = tss.withName("InviteMembersModal").create({
	helpingMessageContainer: {
		paddingTop: fr.spacing("2v"),
		marginBottom: fr.spacing("6v"),
	},
	modalHeader: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	modalHeading: {
		color: fr.colors.decisions.text.title.grey.default,
		fontFamily: "Marianne",
		fontSize: "1.5rem",
		fontStyle: "normal",
		fontWeight: 700,
		lineHeight: "2rem",
		marginBottom: 0,
	},
	modalSubheading: {
		color: fr.colors.decisions.text.mention.grey.default,
		fontFamily: "Marianne",
		fontSize: "0.75rem",
		fontStyle: "normal",
		fontWeight: 400,
		lineHeight: fr.spacing("5v"),
		margin: 0,
	},
});

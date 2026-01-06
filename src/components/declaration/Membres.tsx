import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { TRPCClientError } from "@trpc/client";
import { tss } from "tss-react";
import z from "zod";
import type { Declaration } from "~/payload/payload-types";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";

const inviteMembersModal = createModal({
	id: "inviteMembersModal",
	isOpenedByDefault: false,
});

interface MembresProps {
	declaration: Declaration;
}

const inviteMemberFormSchema = z.object({
	email: z.email("Adresse e-mail invalide"),
	role: z.enum(["reader", "admin"], { message: "Rôle invalide" }),
});

export default function Membres({ declaration }: MembresProps) {
	const { classes } = useStyles();

	const { data: tmpAccessRights, isLoading: isLoadingAccessRights } =
		api.accessRight.getByDeclarationId.useQuery({ id: declaration.id });

	const accessRights = tmpAccessRights ?? [];

	const { mutateAsync: createAccessRight, error: createAccessRightError } =
		api.accessRight.create.useMutation();

	const form = useAppForm({
		defaultValues: {
			email: "",
			role: "reader",
		} as z.infer<typeof inviteMemberFormSchema>,
		validators: { onSubmit: inviteMemberFormSchema },
		onSubmit: async ({ value, formApi }) => {
			try {
				await createAccessRight({
					declarationId: declaration.id,
					email: value.email,
					role: value.role,
				});
				inviteMembersModal.close();
				form.reset();
			} catch (e) {
				if (e instanceof TRPCClientError && e.data?.code === "NOT_FOUND") {
					console.log(e.message);
					formApi.fieldInfo.email.instance?.setErrorMap({
						onSubmit: { message: e.message },
					});
				}
			}
		},
	});

	const StatusBadge = ({ status }: { status: string }) => {
		switch (status) {
			case "admin":
				return (
					<Badge key="status" className={classes.adminBadge}>
						Administrateur
					</Badge>
				);
			default:
				return (
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Badge key="status" className={classes.readerBadge}>
							Lecteur
						</Badge>
						<div className={classes.buttonsContainer}>
							<Button
								size="small"
								priority="tertiary"
								className={classes.button}
							>
								Retirer l’accès
							</Button>
							<Button
								size="small"
								priority="tertiary"
								className={classes.button}
							>
								Renvoyer l'invitation
							</Button>
						</div>
					</div>
				);
		}
	};

	return (
		<section id="members-tab">
			<div className={classes.modal}>
				<Button
					priority="secondary"
					iconId="fr-icon-user-add-line"
					onClick={() => inviteMembersModal.open()}
				>
					Inviter un membre
				</Button>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<inviteMembersModal.Component
						buttons={[
							{
								children: "Annuler",
								onClick: () => inviteMembersModal.close(),
							},
							{ children: "Inviter", type: "submit", doClosesModal: false },
						]}
						title={
							<section id="modal-header">
								<h1 className={classes.modalHeading}>Inviter un membre</h1>
								<p className={classes.modalSubheading}>
									Tous les champs sont obligatoires
								</p>
							</section>
						}
					>
						<form.AppField name="email">
							{(field) => (
								<field.TextField
									description="Format attendu : nom@domaine.fr"
									label="Adresse e-mail"
									{...field}
								/>
							)}
						</form.AppField>
						<form.AppField name="role">
							{(field) => (
								<field.RadioField
									label="Rôle"
									options={[
										{
											description:
												"Peut voir les informations de la déclaration, mais ne peut pas faire de modification ou inviter d’autres membres",
											label: "Lecteur",
											value: "reader",
										},
										{
											description:
												"Peut modifier tout aspect de la déclaration et inviter de nouveaux membres",
											label: "Administrateur",
											value: "admin",
										},
									]}
								/>
							)}
						</form.AppField>
					</inviteMembersModal.Component>
				</form>
			</div>
			<Table
				fixed
				data={accessRights.map(({ user, role }) => [
					<div key={`user-${user.id}`}>{user.email}</div>,
					<div key={`mail-${user.id}`}>{user.email}</div>,
					<div key={`status-${user.id}`}>
						<StatusBadge status={role} />
					</div>,
				])}
				headers={[
					<div key="user" className={classes.tableHeader}>
						Utilisateur{" "}
						<Button
							iconId="fr-icon-arrow-up-down-fill"
							priority="tertiary"
							title=""
						/>
					</div>,
					<div key="mail" className={classes.tableHeader}>
						Mail{" "}
						<Button
							iconId="fr-icon-arrow-up-down-fill"
							priority="tertiary"
							title=""
						/>
					</div>,
					<div key="status" className={classes.tableHeader}>
						Statut{" "}
						<Button
							iconId="fr-icon-arrow-up-down-fill"
							priority="tertiary"
							title=""
						/>
					</div>,
				]}
			/>
		</section>
	);
}

const useStyles = tss.withName(Membres.name).create({
	adminBadge: {
		backgroundColor:
			fr.colors.decisions.background.contrast.purpleGlycine.default,
		color: fr.colors.decisions.text.label.purpleGlycine.default,
	},
	readerBadge: {
		backgroundColor: fr.colors.decisions.background.contrast.info.default,
		color: fr.colors.decisions.text.default.info.default,
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("4v"),
	},
	button: {
		fontSize: "1rem",
		lineHeight: "1.5rem",
		fontFamily: "Marianne",
		fontWeight: 500,
	},
	modal: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
		alignItems: "flex-end",
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
	},
	tableHeader: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
	},
});

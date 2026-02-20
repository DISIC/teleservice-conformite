import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { TRPCClientError } from "@trpc/client";
import { tss } from "tss-react";
import z from "zod";
import type { AccessRight } from "~/payload/payload-types";
import type { AccesRightAugmented } from "~/server/api/routers/accesRight";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { type Session, authClient } from "~/utils/auth-client";
import { useAppForm } from "~/utils/form/context";
import { Loader } from "../system/Loader";

const inviteMembersModal = createModal({
	id: "inviteMembersModal",
	isOpenedByDefault: false,
});

const inviteMemberFormSchema = z.object({
	email: z.email("Adresse e-mail invalide"),
	role: z.enum(["admin"], { message: "Rôle invalide" }),
});

interface MembresProps {
	declaration: PopulatedDeclaration;
}

export default function Membres({ declaration }: MembresProps) {
	const { classes, cx } = useStyles();
	const { data: session } = authClient.useSession();

	const apiUtils = api.useUtils();

	const { data: tmpAccessRights, isLoading: isLoadingAccessRight } =
		api.accessRight.getByDeclarationId.useQuery({ id: declaration.id });

	const accessRights = tmpAccessRights ?? [];

	const { mutateAsync: createAccessRight } = api.accessRight.create.useMutation(
		{
			onSuccess: () =>
				apiUtils.accessRight.getByDeclarationId.invalidate({
					id: declaration.id,
				}),
		},
	);

	const form = useAppForm({
		defaultValues: {
			email: "",
			role: "admin",
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
				if (e instanceof TRPCClientError && e.data?.code === "CONFLICT") {
					formApi.fieldInfo.email.instance?.setErrorMap({
						onSubmit: { message: e.message },
					});
				}
			}
		},
	});

	const StatusBadge = ({
		role,
		status,
	}: { role: AccessRight["role"]; status: AccessRight["status"] }) => {
		if (status === "pending") {
			return <Badge key="status">Invitation envoyée</Badge>;
		}

		switch (role) {
			case "admin":
				return (
					<Badge key="status" className={classes.adminBadge}>
						Administrateur
					</Badge>
				);
		}
	};

	const ActionsButtons = ({
		accessRight,
		session,
	}: { accessRight: AccesRightAugmented; session: Session | null }) => {
		if (Number(session?.user.id) === accessRight?.user?.id) {
			return <></>;
		}

		return (
			<div className={classes.buttonsContainer}>
				<Button size="small" priority="secondary" className={classes.button}>
					Retirer l’accès
				</Button>
				{accessRight.status === "pending" && (
					<Button size="small" priority="secondary" className={classes.button}>
						Renvoyer l'invitation
					</Button>
				)}
			</div>
		);
	};

	if (isLoadingAccessRight) return <Loader />;

	return (
		<section id="members-tab">
			<div className={classes.wrapperMembers}>
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
								type: "button",
								onClick: () => {
									inviteMembersModal.close();
									setTimeout(() => form.reset(), 200);
								},
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
				bordered
				className={classes.table}
				data={accessRights.map((accessRight) => [
					<div key={`user-${accessRight.id}`}>
						{accessRight?.user?.name || "-"}
					</div>,
					<div key={`mail-${accessRight.id}`}>
						{accessRight?.user?.email || accessRight.tmpUserEmail}
					</div>,
					<div key={`status-${accessRight.id}`}>
						<StatusBadge role={accessRight.role} status={accessRight.status} />
					</div>,
					<ActionsButtons
						key={`actions-${accessRight.id}`}
						accessRight={accessRight}
						session={session}
					/>,
				])}
				headers={[
					<div key="user" className={classes.tableHeader}>
						Utilisateur
					</div>,
					<div key="mail" className={classes.tableHeader}>
						Mail
					</div>,
					<div key="status" className={classes.tableHeader}>
						Statut
					</div>,
					<div key="actions" />,
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
		width: "min-content",
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("2v"),
	},
	button: {
		width: "max-content",
	},
	wrapperMembers: {
		display: "flex",
		flexDirection: "column",
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
	table: {
		table: {
			display: "table",
		},
		"thead::after, tbody::after": {
			backgroundImage: "none!important",
		},
		"tbody::after": {
			borderBottom: `1px solid ${fr.colors.decisions.border.contrast.grey.default}`,
		},
		"table tbody tr": {
			backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.contrast.grey.default},  ${fr.colors.decisions.border.contrast.grey.default})!important`,
		},
	},
	tableHeader: {
		minWidth: "max-content",
		// display: "flex",
		// alignItems: "center",
		// gap: fr.spacing("2v"),
	},
});

import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useState } from "react";
import { tss } from "tss-react";
import type { AccessRight } from "~/payload/payload-types";
import type { AccesRightAugmented } from "~/server/api/routers/accesRight";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { authClient, type Session } from "~/utils/auth-client";
import InviteMembersModal, {
	type InviteMembersModalActions,
} from "../modal/InviteMembersModal";
import RemoveAccessRightModal, {
	type RemoveAccessRightModalActions,
} from "../modal/RemoveAccessRightModal";
import { Loader } from "../system/Loader";

interface MembresProps {
	declaration: PopulatedDeclaration;
}

export default function Membres({ declaration }: MembresProps) {
	const { classes } = useStyles();
	const { data: session } = authClient.useSession();

	const { mutateAsync: resendInviteMail } =
		api.accessRight.resendInviteMail.useMutation();
	const { data: tmpAccessRights, isLoading: isLoadingAccessRight } =
		api.accessRight.getByDeclarationId.useQuery({ id: declaration.id });

	const accessRights = tmpAccessRights ?? [];

	const [inviteMembersModalActions] = useState<InviteMembersModalActions>({});
	const [removeAccessRightModalActions] =
		useState<RemoveAccessRightModalActions>({});

	const StatusBadge = ({
		role,
		status,
	}: {
		role: AccessRight["role"];
		status: AccessRight["status"];
	}) => {
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
	}: {
		accessRight: AccesRightAugmented;
		session: Session | null;
	}) => {
		if (Number(session?.user.id) === accessRight?.user?.id) return;

		const isCreator = declaration.created_by?.id === Number(session?.user.id);
		const isInvitePending = accessRight.status === "pending";

		const displayName = accessRight?.user?.name
			? `${accessRight.user.name} (${accessRight.user.email})`
			: (accessRight.tmpUserEmail ?? "");

		return (
			<div className={classes.buttonsContainer}>
				{isCreator && (
					<Button
						size="small"
						priority="secondary"
						className={classes.button}
						onClick={() =>
							removeAccessRightModalActions.open?.({
								accessRightId: accessRight.id,
								displayName,
							})
						}
					>
						Retirer l'accès
					</Button>
				)}
				{isInvitePending && (
					<Button
						size="small"
						priority="secondary"
						className={classes.button}
						onClick={() => resendInviteMail(accessRight.id)}
					>
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
					onClick={() => inviteMembersModalActions.open?.()}
				>
					Inviter un membre
				</Button>
				<InviteMembersModal
					declarationId={declaration.id}
					actions={inviteMembersModalActions}
				/>
				<RemoveAccessRightModal
					declarationId={declaration.id}
					actions={removeAccessRightModalActions}
				/>
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

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useEffect, useId, useState } from "react";
import { api } from "~/utils/api";

export type RemoveAccessRightModalParams = {
	accessRightId: number;
	displayName: string;
};

export type RemoveAccessRightModalActions = {
	open?: (params: RemoveAccessRightModalParams) => void;
};

interface RemoveAccessRightModalProps {
	declarationId: number;
	actions: RemoveAccessRightModalActions;
}

export default function RemoveAccessRightModal({
	declarationId,
	actions,
}: RemoveAccessRightModalProps) {
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `removeAccessRightModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const [openState, setOpenState] = useState<
		RemoveAccessRightModalParams | undefined
	>(undefined);

	const apiUtils = api.useUtils();
	const { mutateAsync: removeAccessRight } = api.accessRight.delete.useMutation(
		{
			onSuccess: () =>
				apiUtils.accessRight.getByDeclarationId.invalidate({
					id: declarationId,
				}),
		},
	);

	useEffect(() => {
		actions.open = (params) => {
			setOpenState(params);
			modal.open();
		};
	}, []);

	useIsModalOpen(modal, {
		onConceal: () => {
			setOpenState(undefined);
		},
	});

	return (
		<modal.Component
			title="Confirmer la suppression"
			buttons={[
				{
					children: "Annuler",
					type: "button",
					onClick: modal.close,
				},
				{
					children: "Confirmer",
					onClick: () => {
						if (openState) removeAccessRight(openState.accessRightId);
					},
					type: "button",
					doClosesModal: true,
				},
			]}
		>
			<p>
				Êtes-vous sûr de vouloir retirer l'accès à{" "}
				<strong>{openState?.displayName}</strong> ?
			</p>
		</modal.Component>
	);
}

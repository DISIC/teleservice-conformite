import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useEffect, useId, useState } from "react";
import { api } from "~/lib/api";
import { logMutationError } from "~/utils/declaration-helper";

export type RevertModalActions = {
	open?: () => void;
};

interface RevertModalProps {
	declarationId: number;
	actions: RevertModalActions;
	/** Called after a successful revert — re-runs the page's SSR fetch. */
	onReverted: () => void;
}

/**
 * Confirmation gate for "Annuler les modifications". Owns the
 * `revertToPublished` mutation, which transactionally restores every Section
 * from `publishedContent` — so the modal warns the changes are permanently
 * lost before firing it.
 */
export function RevertModal({
	declarationId,
	actions,
	onReverted,
}: RevertModalProps) {
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `revertModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const { mutate: revertToPublished, isPending } =
		api.declaration.revertToPublished.useMutation({
			onSuccess: () => {
				modal.close();
				onReverted();
			},
			onError: logMutationError("reverting declaration", declarationId),
		});

	useEffect(() => {
		actions.open = () => modal.open();
	}, []);

	return (
		<modal.Component
			title="Annuler les modifications"
			buttons={[
				{
					children: "Conserver les modifications",
					type: "button",
					disabled: isPending,
				},
				{
					children: "Annuler les modifications",
					priority: "primary",
					type: "button",
					doClosesModal: false,
					disabled: isPending,
					onClick: () => {
						revertToPublished({ id: declarationId });
					},
				},
			]}
		>
			<p>
				Cette action restaurera la déclaration telle qu'elle était lors de sa
				dernière publication.{" "}
				<strong>
					Toutes les modifications réalisées depuis seront définitivement
					perdues.
				</strong>
			</p>
		</modal.Component>
	);
}

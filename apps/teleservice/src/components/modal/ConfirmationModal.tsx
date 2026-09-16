import { fr } from "@codegouvfr/react-dsfr";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { tss } from "tss-react";
import { useModalReturnFocus } from "~/hooks/useModalReturnFocus";

export type ConfirmationModalParams = {
	title: string;
	description: ReactNode;
	cancelLabel?: string;
	confirmLabel?: string;
	confirmIconId?: FrIconClassName | RiIconClassName;
	onConfirm: () => void;
};

export type ConfirmationModalActions = {
	open?: (params: ConfirmationModalParams) => void;
};

interface ConfirmationModalProps {
	actions: ConfirmationModalActions;
}

// The dialog fades out over the DSFR transition, so anything that repaints the page
// behind it waits for that duration, read from the dialog itself.
function runAfterFadeOut(modalId: string, run: () => void) {
	const dialog = document.getElementById(modalId);
	const durations = (
		dialog ? getComputedStyle(dialog).transitionDuration : ""
	).split(",");

	window.setTimeout(
		run,
		Math.max(
			0,
			...durations.map((duration) => Number.parseFloat(duration) * 1000 || 0),
		),
	);
}

export function ConfirmationModal({ actions }: ConfirmationModalProps) {
	const id = useId();
	const { classes } = useStyles();

	const [modal] = useState(() =>
		createModal({
			id: `confirmationModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const openModal = useModalReturnFocus(modal);

	const [params, setParams] = useState<ConfirmationModalParams | undefined>(
		undefined,
	);
	const pendingConfirmRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		actions.open = (nextParams) => {
			setParams(nextParams);
			openModal();
		};
	}, [actions, openModal]);

	useIsModalOpen(modal, {
		onConceal: () => {
			const pendingConfirm = pendingConfirmRef.current;
			pendingConfirmRef.current = null;
			// The confirmed action only runs once the dialog has faded out, so the page
			// behind it never updates while the dialog is still visible. The params are
			// kept until the next open for the same reason: the fading dialog keeps its
			// title and description.
			if (pendingConfirm) runAfterFadeOut(modal.id, pendingConfirm);
		},
	});

	return (
		<modal.Component
			title={params?.title ?? ""}
			className={classes.modal}
			buttons={[
				{
					doClosesModal: true,
					priority: "secondary",
					type: "button",
					children: params?.cancelLabel ?? "Annuler",
				},
				{
					doClosesModal: true,
					priority: "primary",
					type: "button",
					children: params?.confirmLabel ?? "Confirmer",
					iconId: params?.confirmIconId ?? "fr-icon-check-line",
					onClick: () => {
						pendingConfirmRef.current = params?.onConfirm ?? null;
					},
				},
			]}
		>
			{params?.description}
		</modal.Component>
	);
}

const useStyles = tss.withName(ConfirmationModal.name).create({
	modal: {
		"& .fr-modal__footer": {
			marginTop: fr.spacing("8v"),
			borderTop: `2px solid ${fr.colors.decisions.border.default.grey.default}`,
		},
		"& .fr-modal__content": {
			marginBottom: fr.spacing("8v"),
		},
	},
});

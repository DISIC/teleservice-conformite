import type { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useCallback, useRef } from "react";

type Modal = ReturnType<typeof createModal>;

// DSFR sends the focus back to react-dsfr's hidden control button on close, so the opener is remembered here.
export function useModalReturnFocus(modal: Modal) {
	const triggerRef = useRef<HTMLElement | null>(null);

	useIsModalOpen(modal, {
		onConceal: () => {
			const trigger = triggerRef.current;
			triggerRef.current = null;
			if (trigger?.isConnected) trigger.focus();
		},
	});

	return useCallback(() => {
		const active = document.activeElement;
		triggerRef.current = active instanceof HTMLElement ? active : null;
		modal.open();
	}, [modal]);
}

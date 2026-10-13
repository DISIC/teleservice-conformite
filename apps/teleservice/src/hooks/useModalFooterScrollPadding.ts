import type { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useEffect, useRef } from "react";

type Modal = ReturnType<typeof createModal>;

// The DSFR footer is sticky inside the scrolling body, so a field focused by keyboard would scroll in under it.
export function useModalFooterScrollPadding(modal: Modal) {
	const observerRef = useRef<ResizeObserver | null>(null);

	const disconnect = () => {
		observerRef.current?.disconnect();
		observerRef.current = null;
	};

	useIsModalOpen(modal, {
		onDisclose: () => {
			disconnect();
			const dialog = document.getElementById(modal.id);
			const body = dialog?.querySelector<HTMLElement>(".fr-modal__body");
			const footer = dialog?.querySelector<HTMLElement>(".fr-modal__footer");
			if (!body || !footer) return;

			const observer = new ResizeObserver(() => {
				body.style.scrollPaddingBottom = `${footer.offsetHeight}px`;
			});
			observer.observe(footer);
			observerRef.current = observer;
		},
		onConceal: disconnect,
	});

	useEffect(() => disconnect, []);
}

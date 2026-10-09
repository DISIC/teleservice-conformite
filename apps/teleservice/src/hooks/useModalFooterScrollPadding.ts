import type { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useEffect } from "react";

type Modal = ReturnType<typeof createModal>;

// The DSFR footer is sticky inside the scrolling body, so a field focused by keyboard would scroll in under it.
export function useModalFooterScrollPadding(modal: Modal) {
	useEffect(() => {
		const dialog = document.getElementById(modal.id);
		const body = dialog?.querySelector<HTMLElement>(".fr-modal__body");
		const footer = dialog?.querySelector<HTMLElement>(".fr-modal__footer");
		if (!body || !footer) return;

		const observer = new ResizeObserver(() => {
			body.style.scrollPaddingBottom = `${footer.offsetHeight}px`;
		});
		observer.observe(footer);
		return () => observer.disconnect();
	}, [modal]);
}

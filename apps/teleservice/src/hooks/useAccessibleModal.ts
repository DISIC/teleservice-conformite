import type { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useModalEscape } from "./useModalEscape";
import { useModalFooterScrollPadding } from "./useModalFooterScrollPadding";
import { useModalReturnFocus } from "./useModalReturnFocus";

type Modal = ReturnType<typeof createModal>;

/** Keyboard fixes every DSFR modal needs; returns the function that opens it. */
export function useAccessibleModal(modal: Modal) {
	useModalEscape(modal);
	useModalFooterScrollPadding(modal);
	return useModalReturnFocus(modal);
}

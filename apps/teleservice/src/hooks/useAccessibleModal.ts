import type { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useModalEscape } from "./useModalEscape";
import { useModalFooterScrollPadding } from "./useModalFooterScrollPadding";
import { useModalReturnFocus } from "./useModalReturnFocus";

type Modal = ReturnType<typeof createModal>;

export function useAccessibleModal(modal: Modal) {
	useModalEscape(modal);
	useModalFooterScrollPadding(modal);
	return useModalReturnFocus(modal);
}

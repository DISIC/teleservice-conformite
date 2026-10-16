import type { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useEffect } from "react";

type Modal = ReturnType<typeof createModal>;

// DSFR ignores Escape while focus is on a form field, which traps keyboard users inside the dialog.
const FIELD_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function useModalEscape(modal: Modal) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			const active = document.activeElement;
			if (!active || !FIELD_TAGS.has(active.tagName)) return;
			if (active.hasAttribute("data-fr-js-tooltip-referent")) return;
			if (!document.getElementById(modal.id)?.contains(active)) return;
			modal.close();
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [modal]);
}

import { useEffect } from "react";

// Guards only refresh and tab-close; in-app navigation flushes the pending save
// on unmount instead.
export function useUnsavedChangesWarning(hasUnsavedChanges: () => boolean) {
	useEffect(() => {
		const handler = (event: BeforeUnloadEvent) => {
			if (!hasUnsavedChanges()) return;
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [hasUnsavedChanges]);
}

import { createContext, type ReactNode, useContext } from "react";

const ToCompleteContext = createContext(false);

/**
 * Whether unfilled data is flagged "À compléter". A first pass through the
 * walkthrough shows no such flag: the declarant is filling the form, not
 * repairing it. Set once per page from the declarant's own visit history.
 */
export function ToCompleteGuidance({
	show,
	children,
}: {
	show: boolean;
	children: ReactNode;
}) {
	return (
		<ToCompleteContext.Provider value={show}>
			{children}
		</ToCompleteContext.Provider>
	);
}

export const useShowToComplete = () => useContext(ToCompleteContext);

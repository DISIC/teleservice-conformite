import { createContext, type ReactNode, useContext } from "react";

const ToCompleteContext = createContext(false);

/** A first pass through the walkthrough flags nothing "À compléter": the
 *  declarant is filling the form, not repairing it. */
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

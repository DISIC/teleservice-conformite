import { createContext, type ReactNode, useContext } from "react";
import type {
	LibrarySectionKind,
	PendingSourceModes,
	SourceModeValue,
} from "~/domain/declaration/sourceMode";

type PendingSourceModesValue = {
	pending: PendingSourceModes;
	setPending: (kind: LibrarySectionKind, value: SourceModeValue | null) => void;
};

const PendingSourceModesContext = createContext<PendingSourceModesValue>({
	pending: {},
	setPending: () => {},
});

/** Page-level owner of unsaved radio choices, so the publish gate sees what the radio shows. */
export function PendingSourceModesProvider({
	value,
	children,
}: {
	value: PendingSourceModesValue;
	children: ReactNode;
}) {
	return (
		<PendingSourceModesContext.Provider value={value}>
			{children}
		</PendingSourceModesContext.Provider>
	);
}

export const usePendingSourceModes = () =>
	useContext(PendingSourceModesContext);

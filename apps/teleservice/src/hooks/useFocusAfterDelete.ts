import { useCallback, useEffect, useRef } from "react";

type FocusAfterDeleteOptions = {
	idPrefix: string;
	fallbackId: string;
	isFetching: boolean;
};

// A deleted item's button goes with it: focus the next one on screen, or the previous after the last.
export function useFocusAfterDelete({
	idPrefix,
	fallbackId,
	isFetching,
}: FocusAfterDeleteOptions) {
	const targetIdRef = useRef<string | null>(null);

	useEffect(() => {
		const targetId = targetIdRef.current;
		if (isFetching || !targetId) return;
		targetIdRef.current = null;
		(
			document.getElementById(targetId) ?? document.getElementById(fallbackId)
		)?.focus();
	}, [isFetching, fallbackId]);

	const deleteButtonId = useCallback(
		(itemId: number | string) => `${idPrefix}${itemId}`,
		[idPrefix],
	);

	// Read from the page, not the data: a paginated list only renders part of it.
	const rememberNeighbour = useCallback(
		(itemId: number | string) => {
			const buttons = [
				...document.querySelectorAll<HTMLElement>(`[id^="${idPrefix}"]`),
			];
			const index = buttons.findIndex(
				({ id }) => id === `${idPrefix}${itemId}`,
			);
			const neighbour = buttons[index + 1] ?? buttons[index - 1];
			targetIdRef.current = neighbour?.id ?? fallbackId;
		},
		[idPrefix, fallbackId],
	);

	const forget = useCallback(() => {
		targetIdRef.current = null;
	}, []);

	return { deleteButtonId, rememberNeighbour, forget };
}

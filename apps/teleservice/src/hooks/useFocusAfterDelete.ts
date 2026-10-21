import { useCallback, useEffect, useRef } from "react";

type FocusAfterDeleteOptions = {
	/** Prefix of every delete button's id; the item id completes it. */
	idPrefix: string;
	/** Focused when no other delete button is left on screen. */
	fallbackId: string;
	/** The list query's fetching flag: the focus moves once the reloaded list is rendered. */
	isFetching: boolean;
};

/**
 * A deleted item's button disappears with it, so the focus moves to the next
 * delete button on screen, or the previous one when the last is deleted.
 */
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

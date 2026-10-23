import { useCallback, useEffect, useRef } from "react";

type FocusAfterDeleteOptions = {
	itemName: string;
	isFetching: boolean;
	deleteMutation: {
		mutate: (
			variables: { id: number },
			options: { onError: () => void },
		) => void;
	};
};

// A deleted item's button goes with it: focus the next one on screen, or the previous after the last.
export function useFocusAfterDelete({
	itemName,
	isFetching,
	deleteMutation,
}: FocusAfterDeleteOptions) {
	const idPrefix = `delete-${itemName}-`;
	const addButtonId = `add-${itemName}-button`;
	const targetIdRef = useRef<string | null>(null);

	useEffect(() => {
		const targetId = targetIdRef.current;
		if (isFetching || !targetId) return;
		targetIdRef.current = null;
		(
			document.getElementById(targetId) ?? document.getElementById(addButtonId)
		)?.focus();
	}, [isFetching, addButtonId]);

	const deleteButtonId = useCallback(
		(itemId: number) => `${idPrefix}${itemId}`,
		[idPrefix],
	);

	// Read from the page, not the data: a paginated list only renders part of it.
	const rememberNeighbour = useCallback(
		(itemId: number) => {
			const buttons = [
				...document.querySelectorAll<HTMLElement>(`[id^="${idPrefix}"]`),
			];
			const index = buttons.findIndex(
				({ id }) => id === `${idPrefix}${itemId}`,
			);
			const neighbour = buttons[index + 1] ?? buttons[index - 1];
			targetIdRef.current = neighbour?.id ?? addButtonId;
		},
		[idPrefix, addButtonId],
	);

	const { mutate } = deleteMutation;
	const deleteItem = useCallback(
		(itemId: number) => {
			rememberNeighbour(itemId);
			mutate(
				{ id: itemId },
				{
					onError: () => {
						targetIdRef.current = null;
					},
				},
			);
		},
		[rememberNeighbour, mutate],
	);

	return { addButtonId, deleteButtonId, deleteItem };
}

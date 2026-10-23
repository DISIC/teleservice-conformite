import { useCallback, useState } from "react";

// Next keeps a page's state across route params: state tied to one id must start over on the next.
export function useScopedState<T>(scope: number | string, initial: T) {
	const [scoped, setScoped] = useState({ scope, value: initial });
	const value = scoped.scope === scope ? scoped.value : initial;
	const update = useCallback(
		(next: (current: T) => T) =>
			setScoped((current) => ({
				scope,
				value: next(current.scope === scope ? current.value : initial),
			})),
		[scope, initial],
	);
	return [value, update] as const;
}

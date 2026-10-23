type DsfrCollapse = {
	disclose: () => void;
	conceal: () => void;
	isEnabled: boolean;
};

type DsfrApi = (element: Element) => { collapse?: DsfrCollapse } | undefined;

// The DSFR runtime owns the open state of an accordion: React props set the
// initial state only, folding one afterwards has to go through its own API.
export function setCollapsesExpanded(
	collapses: Iterable<Element>,
	expanded: boolean,
) {
	const dsfr = (window as unknown as { dsfr?: DsfrApi }).dsfr;

	if (!dsfr) return;

	for (const element of collapses) {
		const collapse = dsfr(element)?.collapse;

		if (!collapse) continue;

		if (expanded) collapse.disclose();
		else collapse.conceal();
	}
}

const DSFR_START_TIMEOUT_MS = 10_000;

// The DSFR runtime starts after hydration and ignores a disclose until it has
// bound the accordion button, a few frames later. Returns a cancel function.
export function discloseWhenReady(collapse: Element) {
	const deadline = performance.now() + DSFR_START_TIMEOUT_MS;
	let request = 0;

	const attempt = () => {
		const dsfr = (window as unknown as { dsfr?: DsfrApi }).dsfr;
		const instance = dsfr?.(collapse)?.collapse;

		if (instance?.isEnabled) return instance.disclose();
		if (performance.now() < deadline) request = requestAnimationFrame(attempt);
	};

	attempt();
	return () => cancelAnimationFrame(request);
}

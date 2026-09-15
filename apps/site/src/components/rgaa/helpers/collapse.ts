type DsfrCollapse = {
	disclose: () => void;
	conceal: () => void;
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

/** Known axe false positives, each with the reason it is not an RGAA defect. Empty until one is proven. */
export const A11Y_ALLOWLIST: {
	rule: string;
	/** Substring of the axe target selector; omit to cover every node of the rule. */
	target?: string;
	reason: string;
}[] = [];

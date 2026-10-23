// RGAA requires links opening a new window to announce it in their title.
export const newTabTitle = (label: string) => `${label}, nouvelle fenêtre`;

export const newTabLinkProps = (label: string) => ({
	target: "_blank",
	rel: "noopener noreferrer",
	title: newTabTitle(label),
});

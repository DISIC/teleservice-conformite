// Heading anchors: accents folded, punctuation dropped, spaces to dashes ("Notion d’accessibilité" → "notion-daccessibilite").
export function slugify(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");
}

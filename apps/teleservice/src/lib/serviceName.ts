export const SERVICE_NAME =
	"Téléservice de déclaration d’accessibilité numérique";

export const pageTitle = (...parts: (string | null | undefined)[]) =>
	[...parts, SERVICE_NAME].filter(Boolean).join(" - ");

import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/**
 * Minimal Brouillon that passes the publish gate: infos filled, audit answered
 * (not realised, so the three realised-only Sub-sections are inapplicable),
 * schema deliberately Skipped, contact Custom. Tests override only their delta.
 */
export function completeDeclaration(
	overrides: Partial<PopulatedDeclaration> = {},
): PopulatedDeclaration {
	return {
		id: 1,
		name: "Mon service",
		url: "https://www.example.fr",
		app_kind: "website",
		status: "unpublished",
		publishedContent: null,
		entity: { id: 1, name: "DINUM", kind: "Protection sociale" },
		created_by: null,
		audit: { isRealised: false },
		schema: { skipped: true },
		contact: { name: "Référent accessibilité", email: "a11y@example.fr" },
		...overrides,
	} as unknown as PopulatedDeclaration;
}

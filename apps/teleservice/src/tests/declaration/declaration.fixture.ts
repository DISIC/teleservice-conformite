import { extractDeclarationContentToPublish } from "~/domain/declaration/published/snapshot";
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
		first_published_at: "2026-08-01T00:00:00.000Z",
		entity: { id: 1, name: "DINUM", kind: "Protection sociale" },
		created_by: null,
		audit: { isRealised: false },
		schema: { skipped: true },
		contact: { name: "Référent accessibilité", email: "a11y@example.fr" },
		...overrides,
	} as unknown as PopulatedDeclaration;
}

const PUBLISHED_AT = "2026-08-27T09:30:00.000Z";

/** A Publiée Declaration whose snapshot matches its current content. */
export function publishedDeclaration(
	overrides: Partial<PopulatedDeclaration> = {},
): PopulatedDeclaration {
	const content = completeDeclaration(overrides);
	return completeDeclaration({
		...overrides,
		status: "published",
		published_at: PUBLISHED_AT,
		publishedContent: JSON.stringify(
			extractDeclarationContentToPublish(content, {
				publishedAt: new Date(PUBLISHED_AT),
			}),
		),
	});
}

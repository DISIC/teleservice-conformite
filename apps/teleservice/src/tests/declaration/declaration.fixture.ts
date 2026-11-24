import { extractDeclarationContentToDeposit } from "~/domain/declaration/deposited/snapshot";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/**
 * Minimal Brouillon that passes the deposit gate: infos filled, audit answered
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
		domain: "Protection sociale",
		status: "undeposited",
		depositedContent: null,
		first_published_at: "2026-08-01T00:00:00.000Z",
		entity: { id: 1, name: "DINUM" },
		created_by: null,
		audit: { isRealised: false },
		schema: { skipped: true },
		contact: { name: "Référent accessibilité", email: "a11y@example.fr" },
		...overrides,
	} as unknown as PopulatedDeclaration;
}

const DEPOSITED_AT = "2026-08-27T09:30:00.000Z";

/** A Déposée Declaration whose snapshot matches its current content. */
export function depositedDeclaration(
	overrides: Partial<PopulatedDeclaration> = {},
): PopulatedDeclaration {
	const content = completeDeclaration(overrides);
	return completeDeclaration({
		...overrides,
		status: "deposited",
		deposited_at: DEPOSITED_AT,
		depositedContent: JSON.stringify(
			extractDeclarationContentToDeposit(content, {
				depositedAt: new Date(DEPOSITED_AT),
			}),
		),
	});
}

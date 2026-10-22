import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { getConformityStatus } from "~/domain/declaration/conformity";
import { OBSOLESCENCE_YEARS } from "~/domain/declaration/obsolescence";
import {
	CONFORMITY_BADGE_SEVERITY,
	DEFENSEUR_URL,
	DELEGUE_URL,
	ARCOM_URL,
	appKindOf,
	badge,
	bulletList,
	formatFrDate,
	hasText,
	rgaaVersionNumber,
} from "~/domain/declaration/published/markdownParts";
import { RGAA5_TEMPLATE } from "~/domain/declaration/published/rgaa5Template";

type TemplateValues = Record<string, string | number | boolean>;

const isSet = (value: TemplateValues[string] | undefined) =>
	value !== undefined && value !== false && value !== "";

/** Unknown names, blocks included, are left as written, so a typo shows on the page rather than hiding content. */
export const renderTemplate = (
	template: string,
	values: TemplateValues,
): string => {
	const block = /\{\{([#^])(\w+)\}\}([\s\S]*?)\{\{\/\2\}\}/g;
	let rendered = template;
	for (let previous = ""; previous !== rendered; ) {
		previous = rendered;
		rendered = rendered.replace(
			block,
			(whole, kind: string, name: string, content: string) => {
				if (!(name in values)) return whole;
				const keep = kind === "#" ? isSet(values[name]) : !isSet(values[name]);
				return keep ? content : "";
			},
		);
	}
	return rendered.replace(/\{\{(\w+)\}\}/g, (whole, name: string) =>
		name in values ? String(values[name]) : whole,
	);
};

const trimmed = (value: string | null) => (hasText(value) ? value.trim() : "");

const serviceKind = (d: PublishedDeclaration) => {
	switch (appKindOf(d.appKindLabel)) {
		case "website":
			return { serviceKind: "le site", ofService: "du site" };
		case "mobile_app":
			return {
				serviceKind: "l’application mobile",
				ofService: "de l’application mobile",
			};
		default:
			return { serviceKind: "le service", ofService: "du service" };
	}
};

export const rgaa5TemplateValues = (
	d: PublishedDeclaration,
	{ obsolete, obsoleteNotice }: { obsolete: boolean; obsoleteNotice: string },
): TemplateValues => {
	const strategyLinks = [
		hasText(d.schema.schemaUrl)
			? `**${hasText(d.schema.schemaName) ? d.schema.schemaName : "Schéma pluriannuel"}** ${d.schema.schemaUrl}`
			: null,
		...d.schema.actionPlanUrls
			.filter((plan) => hasText(plan.url))
			.map(
				(plan) =>
					`**${hasText(plan.name) ? plan.name : "Plan d’action"}** ${plan.url}`,
			),
	].filter((line): line is string => line !== null);

	const realised = d.audit.isRealised;
	const status = getConformityStatus(d.audit.rate, {
		hasBlockingElements: hasText(d.audit.blockingElements),
	});
	// Audit details only exist for a realised audit.
	const audited = (value: string) => (realised ? value : "");
	const nonAccessible = {
		blockingElements: audited(trimmed(d.audit.blockingElements)),
		nonCompliantElements: audited(trimmed(d.audit.nonCompliantElements)),
		disproportionnedCharge: audited(trimmed(d.audit.disproportionnedCharge)),
		optionalElements: audited(trimmed(d.audit.optionalElements)),
	};
	const testEnvironments = audited(
		bulletList(d.audit.testEnvironments).join("\n"),
	);
	const usedTools = audited(bulletList(d.audit.usedTools).join("\n"));

	return {
		name: d.name,
		...serviceKind(d),
		entity: d.entityName,
		publishedOn: formatFrDate(d.firstPublishedAt),
		updatedOn:
			d.publishedAt !== d.firstPublishedAt ? formatFrDate(d.publishedAt) : "",
		obsoleteNotice,
		contactForm: trimmed(d.contact.url),
		contactEmail: trimmed(d.contact.email),
		arcomUrl: ARCOM_URL,
		defenseurUrl: DEFENSEUR_URL,
		delegueUrl: DELEGUE_URL,
		strategyLinks: bulletList(strategyLinks).join("\n"),
		isRealised: realised,
		obsolete,
		obsolescenceYears: OBSOLESCENCE_YEARS,
		conformityBadge:
			!realised || obsolete
				? badge("Non conforme", "error")
				: badge(
						status.label,
						CONFORMITY_BADGE_SEVERITY[status.label] ?? "info",
					),
		status: status.label.toLowerCase(),
		version: rgaaVersionNumber(d.audit.rgaa_version),
		auditedPages: audited(trimmed(d.audit.compliantElements)),
		auditor: d.audit.realised_by,
		auditDate: audited(d.audit.date ? formatFrDate(d.audit.date) : ""),
		auditReport: audited(trimmed(d.audit.auditReport)),
		rate: d.audit.rate,
		hasNonAccessibleContent: Object.values(nonAccessible).some(hasText),
		...nonAccessible,
		hasTestDetails: hasText(testEnvironments) || hasText(usedTools),
		testEnvironments,
		usedTools,
	};
};

export const buildRgaa5Markdown = (
	d: PublishedDeclaration,
	options: { obsolete: boolean; obsoleteNotice: string },
): string =>
	renderTemplate(RGAA5_TEMPLATE, rgaa5TemplateValues(d, options)).trimStart();

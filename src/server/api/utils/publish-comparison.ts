import type { Payload } from "payload";
import type { PopulatedDeclaration } from "./payload-helper";
import type { PublishedDeclaration } from "~/components/declaration/PublishedDeclarationTemplate";
import { extractDeclarationContentToPublish } from "~/components/declaration/PublishedDeclarationTemplate";

export type ComparisonResult = {
	isModified: boolean;
	diffs: string[];
};

export function compareWithPublished(
	current: PublishedDeclaration,
	published: PublishedDeclaration,
): ComparisonResult {
	const diffs: string[] = [];

	if (current.name !== published.name) diffs.push("name");
	if (current.url !== published.url) diffs.push("url");
	if (current.appKindLabel !== published.appKindLabel) diffs.push("appKind");
	if (current.entityName !== published.entityName) diffs.push("entityName");

	if (current.contact.email !== published.contact.email)
		diffs.push("contact.email");
	if (current.contact.url !== published.contact.url) diffs.push("contact.url");

	if (
		current.actionPlan.currentYearSchemaUrl !==
		published.actionPlan.currentYearSchemaUrl
	)
		diffs.push("actionPlan.currentYearSchemaUrl");
	if (
		current.actionPlan.previousYearsSchemaUrl !==
		published.actionPlan.previousYearsSchemaUrl
	)
		diffs.push("actionPlan.previousYearsSchemaUrl");

	const a = current.audit;
	const p = published.audit;

	if (a.rate !== p.rate) diffs.push("audit.rate");
	if (a.realised_by !== p.realised_by) diffs.push("audit.realisedBy");
	if (a.rgaa_version !== p.rgaa_version) diffs.push("audit.rgaa_version");
	if (a.compliantElements !== p.compliantElements)
		diffs.push("audit.compliantElements");
	if (a.nonCompliantElements !== p.nonCompliantElements)
		diffs.push("audit.nonCompliantElements");
	if (a.disproportionnedCharge !== p.disproportionnedCharge)
		diffs.push("audit.disproportionnedCharge");
	if (a.optionalElements !== p.optionalElements)
		diffs.push("audit.optionalElements");
	if (JSON.stringify(a.technologies) !== JSON.stringify(p.technologies))
		diffs.push("audit.technologies");
	if (JSON.stringify(a.testEnvironments) !== JSON.stringify(p.testEnvironments))
		diffs.push("audit.testEnvironments");
	if (JSON.stringify(a.usedTools) !== JSON.stringify(p.usedTools))
		diffs.push("audit.usedTools");

	return { isModified: diffs.length > 0, diffs };
}

export async function recalculateDeclarationStatus(
	payload: Payload,
	declarationId: number,
): Promise<void> {
	const declaration = await payload.findByID({
		collection: "declarations",
		id: declarationId,
		depth: 0,
	});

	if (!declaration?.publishedContent) return;

	const published: PublishedDeclaration = JSON.parse(
		declaration.publishedContent,
	);

	const [audits, contacts, actionPlans, entity] = await Promise.all([
		payload.find({
			collection: "audits",
			where: { declaration: { equals: declarationId } },
			limit: 1,
		}),
		payload.find({
			collection: "contacts",
			where: { declaration: { equals: declarationId } },
			limit: 1,
		}),
		payload.find({
			collection: "action-plans",
			where: { declaration: { equals: declarationId } },
			limit: 1,
		}),
		declaration.entity
			? payload.findByID({
					collection: "entities",
					id: declaration.entity as number,
				})
			: Promise.resolve(null),
	]);

	const populatedDeclaration: PopulatedDeclaration = {
		...(declaration as PopulatedDeclaration),
		audit: audits.docs[0] ?? null,
		contact: contacts.docs[0] ?? null,
		actionPlan: actionPlans.docs[0] ?? null,
		entity: entity ?? null,
		created_by: null,
	};

	const current = extractDeclarationContentToPublish(populatedDeclaration);
	const { isModified } = compareWithPublished(current, published);

	await payload.update({
		collection: "declarations",
		id: declarationId,
		data: {
			status: isModified ? "unpublished" : "published",
		},
		context: { skipStatusRecalculation: true },
	});
}

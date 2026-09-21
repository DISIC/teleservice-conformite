import { getPayload, type Payload } from "payload";
import { OBSOLESCENCE_YEARS } from "~/domain/declaration/obsolescence";
import { extractDeclarationContentToPublish } from "~/domain/declaration/published/snapshot";
import { declarationToGeneralValues } from "~/forms/declaration/declarationSchema";
import config from "~/payload/payload.config";
import {
	createManualDeclaration,
	publishDeclaration,
	updateDeclaration,
} from "~/server/api/routers/declaration/service";
import { skipSchema } from "~/server/api/routers/library/service";
import { loadOwnedDeclaration } from "~/server/api/utils/declaration-access";
import {
	getPopulatedDeclaration,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import {
	saveSection,
	writeDeclaration,
} from "~/server/api/utils/section-write";
import { E2E_IDENTITY } from "./identity";

/** Glossary states a test can start from; each is produced by the app's own write path. */
export const SEED_STATES = [
	"brouillon-incomplete",
	"brouillon-ready",
	"to-verify",
	"publiee",
	"modifiee",
	"published-incomplete",
	"bientot-obsolete",
	"obsolete",
] as const;

export type SeedState = (typeof SEED_STATES)[number];

export type SeededDeclaration = PopulatedDeclaration & { name: string };

export const CONTACT = {
	name: "Référent accessibilité",
	email: "a11y@example.fr",
};

export const connectPayload = (): Promise<Payload> => getPayload({ config });

async function e2eUser(payload: Payload) {
	const { docs } = await payload.find({
		collection: "users",
		where: { email: { equals: E2E_IDENTITY.email } },
		limit: 1,
		depth: 0,
	});
	const user = docs[0];
	if (!user)
		throw new Error(
			`No user ${E2E_IDENTITY.email} in the database: the setup project did not sign in.`,
		);
	return user;
}

const monthsAgo = (months: number): Date => {
	const date = new Date();
	date.setUTCMonth(date.getUTCMonth() - months);
	return date;
};

/** Mirrors `completeDeclaration()` in the unit fixtures: the smallest row that passes the publish gate. */
async function complete(
	payload: Payload,
	declaration: PopulatedDeclaration,
	entityId: number,
): Promise<PopulatedDeclaration> {
	let next = await updateDeclaration(payload, declaration, {
		...declarationToGeneralValues(declaration).general,
		organisation: `Administration ${declaration.name}`,
		domain: "Protection sociale",
		kind: "website",
		url: "https://www.example.fr",
		entityId,
	});
	next = await saveSection(payload, next, "audit", { isRealised: false });
	next = await skipSchema(payload, next);
	return saveSection(payload, next, "contact", CONTACT);
}

/** Rewrites the publish action as if it had happened on `publishedAt`, column and snapshot alike. */
async function publishedOn(
	payload: Payload,
	declaration: PopulatedDeclaration,
	publishedAt: Date,
): Promise<PopulatedDeclaration> {
	const updated = await payload.update({
		collection: "declarations",
		id: declaration.id,
		data: {
			published_at: publishedAt.toISOString(),
			first_published_at: publishedAt.toISOString(),
			publishedContent: JSON.stringify(
				extractDeclarationContentToPublish(declaration, { publishedAt }),
			),
		},
	});
	return getPopulatedDeclaration(updated);
}

/** A seeded row stands for a Declaration its owner has already worked on, so the
 *  "À compléter" guidance is revealed as it would be on a return visit. */
async function markVisited(
	payload: Payload,
	userId: number,
	declarationId: number,
): Promise<void> {
	const { docs } = await payload.find({
		collection: "access-rights",
		where: {
			declaration: { equals: declarationId },
			user: { equals: userId },
		},
		limit: 1,
		depth: 0,
	});
	const own = docs[0];
	if (own)
		await payload.update({
			collection: "access-rights",
			id: own.id,
			data: { firstVisitedAt: new Date().toISOString() },
		});
}

export async function seedDeclaration(
	payload: Payload,
	state: SeedState,
	name: string,
): Promise<SeededDeclaration> {
	const user = await e2eUser(payload);
	// Each seeded row owns its entity: the shared ProConnect entity is only ever touched by UI flows.
	const entity = await payload.create({
		collection: "entities",
		data: { name: `Administration ${name}`, siret: 13002526500013 },
	});
	const id = await createManualDeclaration(payload, user.id, {
		name,
		entityId: entity.id,
	});
	await markVisited(payload, user.id, id);
	const created = await loadOwnedDeclaration(payload, user.id, id);
	const finished = await advance(payload, created, entity.id, state);
	return { ...finished, name };
}

async function advance(
	payload: Payload,
	created: PopulatedDeclaration,
	entityId: number,
	state: SeedState,
): Promise<PopulatedDeclaration> {
	if (state === "brouillon-incomplete") return created;
	const ready = await complete(payload, created, entityId);
	switch (state) {
		case "brouillon-ready":
			return ready;
		case "to-verify":
			return writeDeclaration(payload, ready, {
				contact: { ...ready.contact, toVerify: true },
			});
	}
	const published = await publishDeclaration(payload, ready);
	switch (state) {
		case "publiee":
			return published;
		// Only public fields drift the snapshot: the contact name alone would leave the row clean.
		case "modifiee":
			return saveSection(payload, published, "contact", {
				...CONTACT,
				email: "autre-referent@example.fr",
			});
		case "published-incomplete":
			return saveSection(payload, published, "contact", {
				name: "",
				email: "",
			});
		case "bientot-obsolete":
			return publishedOn(
				payload,
				published,
				monthsAgo(OBSOLESCENCE_YEARS * 12 - 1),
			);
		case "obsolete":
			return publishedOn(
				payload,
				published,
				monthsAgo(OBSOLESCENCE_YEARS * 12 + 1),
			);
	}
}

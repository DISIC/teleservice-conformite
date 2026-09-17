import { describe, expect, it } from "vitest";
import type { LibrarySectionKind } from "~/domain/declaration/sourceMode";
import {
	deleteParent,
	getLinkedDeclarations,
	linkParent,
	skipSchema,
	upsertParent,
} from "~/server/api/routers/library/service";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { fakePayload } from "../payload.fake";
import {
	completeDeclaration,
	publishedDeclaration,
} from "./declaration.fixture";

const OWNER = 1;
const PARENT_ID = 7;

/** Per kind: the Library parent, the copy a link writes, the form values a modal submits, an edit that touches public content. */
const KINDS = {
	contact: {
		collection: "contacts",
		parent: {
			id: PARENT_ID,
			user: OWNER,
			name: "Référent DINUM",
			email: "dinum@example.fr",
			url: null,
		},
		copy: { name: "Référent DINUM", email: "dinum@example.fr", url: "" },
		values: { name: "Référent DINUM", email: "dinum@example.fr", url: "" },
		publicEdit: { email: "autre@example.fr" },
	},
	schema: {
		collection: "schemas",
		parent: {
			id: PARENT_ID,
			user: OWNER,
			name: "Schéma 2026-2028",
			url: null,
			actionPlanUrls: [
				{ id: "row-1", name: "Plan 2026", url: "https://plan.gouv.fr" },
			],
		},
		copy: {
			name: "Schéma 2026-2028",
			url: "",
			actionPlanUrls: [{ name: "Plan 2026", url: "https://plan.gouv.fr" }],
			skipped: false,
		},
		values: {
			name: "Schéma 2026-2028",
			url: "",
			actionPlanUrls: [{ name: "Plan 2026", url: "https://plan.gouv.fr" }],
		},
		publicEdit: { name: "Schéma 2026-2029" },
	},
} satisfies Record<LibrarySectionKind, unknown>;

const KIND_LIST = Object.keys(KINDS) as LibrarySectionKind[];

function seeded(
	kind: LibrarySectionKind,
	declarations: PopulatedDeclaration[] = [],
	parent: { id: number; user: number } = KINDS[kind].parent,
) {
	return fakePayload({ [KINDS[kind].collection]: [parent], declarations });
}

const declaration = (id: number, kind: LibrarySectionKind, group: object) =>
	completeDeclaration({ id, [kind]: group } as never);

const linkedTo = (
	id: number,
	kind: LibrarySectionKind,
	extra: Record<string, unknown> = {},
) =>
	declaration(id, kind, { ...KINDS[kind].copy, parent: PARENT_ID, ...extra });

const readDeclaration = (
	read: ReturnType<typeof fakePayload>["read"],
	id: number,
) => read<PopulatedDeclaration>("declarations", id);

describe.each(KIND_LIST)("linkParent — %s", (kind) => {
	const { collection, parent, copy } = KINDS[kind];

	it("copies the parent's content into the declaration and marks it Linked", async () => {
		const current = completeDeclaration();
		const { payload } = seeded(kind, [current]);

		const result = await linkParent(payload, OWNER, kind, current, PARENT_ID);

		expect(result[kind]).toEqual({
			...current[kind],
			...copy,
			parent: PARENT_ID,
			toVerify: false,
		});
	});

	it("turns a Publiée declaration Modifiée when the linked content differs from its snapshot", async () => {
		const current = publishedDeclaration();
		const { payload } = seeded(kind, [current]);

		const result = await linkParent(payload, OWNER, kind, current, PARENT_ID);

		expect(result.status).toBe("unpublished");
	});

	it("refuses a parent from another user's Library", async () => {
		const current = completeDeclaration();
		const { payload, read } = seeded(kind, [current], {
			...parent,
			user: OWNER + 1,
		});

		await expect(
			linkParent(payload, OWNER, kind, current, PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(readDeclaration(read, 1)).toBe(current);
		expect(read(collection, PARENT_ID)).toBeDefined();
	});
});

describe.each(KIND_LIST)("upsertParent — %s", (kind) => {
	const { collection, parent, copy, values, publicEdit } = KINDS[kind];

	it("creates a new item for the caller and propagates nothing", async () => {
		const linked = linkedTo(1, kind);
		const { payload, read } = seeded(kind, [linked]);

		const created = await upsertParent(payload, OWNER, kind, {
			...values,
			...publicEdit,
		});

		expect(read(collection, created.id)).toEqual({
			id: created.id,
			...values,
			...publicEdit,
			user: OWNER,
		});
		expect(readDeclaration(read, 1)).toBe(linked);
	});

	it("fans an edit out to every linked copy, and only them, clearing their review flag", async () => {
		const custom = completeDeclaration({ id: 3 });
		const { payload, read } = seeded(kind, [
			linkedTo(1, kind),
			linkedTo(2, kind, { toVerify: true }),
			custom,
		]);

		const result = await upsertParent(
			payload,
			OWNER,
			kind,
			{ ...values, ...publicEdit },
			PARENT_ID,
		);

		expect(result).toMatchObject(publicEdit);
		for (const id of [1, 2]) {
			expect(readDeclaration(read, id)?.[kind]).toEqual({
				...copy,
				...publicEdit,
				parent: PARENT_ID,
				toVerify: false,
			});
		}
		expect(readDeclaration(read, 3)).toBe(custom);
	});

	it("turns a linked Publiée declaration Modifiée in the same write", async () => {
		const current = publishedDeclaration({
			[kind]: { ...copy, parent: PARENT_ID },
		} as never);
		const { payload, read } = seeded(kind, [current]);

		await upsertParent(
			payload,
			OWNER,
			kind,
			{ ...values, ...publicEdit },
			PARENT_ID,
		);

		expect(readDeclaration(read, current.id)).toMatchObject({
			status: "unpublished",
			[kind]: publicEdit,
		});
	});

	it("refuses to edit another user's item", async () => {
		const linked = linkedTo(1, kind);
		const foreign = { ...parent, user: OWNER + 1 };
		const { payload, read } = seeded(kind, [linked], foreign);

		await expect(
			upsertParent(
				payload,
				OWNER,
				kind,
				{ ...values, ...publicEdit },
				PARENT_ID,
			),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(read(collection, PARENT_ID)).toBe(foreign);
		expect(readDeclaration(read, 1)).toBe(linked);
	});
});

describe("upsertParent — what stays private", () => {
	it("renaming a contact leaves a linked Publiée declaration clean, the name is never public", async () => {
		const { copy, values } = KINDS.contact;
		const current = publishedDeclaration({
			contact: { ...copy, parent: PARENT_ID },
		} as never);
		const { payload, read } = seeded("contact", [current]);

		await upsertParent(
			payload,
			OWNER,
			"contact",
			{ ...values, name: "Référent renommé" },
			PARENT_ID,
		);

		expect(readDeclaration(read, current.id)).toMatchObject({
			status: "published",
			contact: { name: "Référent renommé" },
		});
	});
});

describe.each(KIND_LIST)("deleteParent — %s", (kind) => {
	const { collection, parent, copy } = KINDS[kind];

	it("detaches every linked copy but keeps its content, then deletes the item", async () => {
		const current = publishedDeclaration({
			[kind]: { ...copy, parent: PARENT_ID },
		} as never);
		const { payload, read } = seeded(kind, [current]);

		await deleteParent(payload, OWNER, kind, PARENT_ID);

		// Detaching changes nothing public: the Publiée row stays clean.
		expect(readDeclaration(read, current.id)).toMatchObject({
			status: "published",
			[kind]: { ...copy, parent: null },
		});
		expect(read(collection, PARENT_ID)).toBeUndefined();
	});

	it("refuses to delete another user's item", async () => {
		const linked = linkedTo(1, kind);
		const foreign = { ...parent, user: OWNER + 1 };
		const { payload, read } = seeded(kind, [linked], foreign);

		await expect(
			deleteParent(payload, OWNER, kind, PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(read(collection, PARENT_ID)).toBe(foreign);
		expect(readDeclaration(read, 1)).toBe(linked);
	});
});

describe("skipSchema", () => {
	const customSchema = {
		name: "Schéma 2026-2028",
		url: "https://schema.gouv.fr",
		actionPlanUrls: [{ name: "Plan 2026", url: "https://plan.gouv.fr" }],
		parent: PARENT_ID,
		skipped: false,
		toVerify: true,
	};

	it("records the deliberate no-schema choice, clearing content and Library link", async () => {
		const current = completeDeclaration({ schema: customSchema } as never);
		const { payload } = seeded("schema", [current]);

		const result = await skipSchema(payload, current);

		expect(result.schema).toEqual({
			name: "",
			url: "",
			actionPlanUrls: [],
			parent: null,
			skipped: true,
			toVerify: false,
		});
	});

	it("turns a Publiée declaration that had a schema Modifiée", async () => {
		const current = publishedDeclaration({ schema: customSchema } as never);
		const { payload } = seeded("schema", [current]);

		const result = await skipSchema(payload, current);

		expect(result.status).toBe("unpublished");
	});
});

describe("getLinkedDeclarations", () => {
	it("lists the linked declarations, and only them, with whether each is Publiée", async () => {
		const { copy } = KINDS.contact;
		const { payload } = seeded("contact", [
			completeDeclaration({
				id: 1,
				name: "Brouillon lié",
				contact: { ...copy, parent: PARENT_ID },
			} as never),
			publishedDeclaration({
				id: 2,
				name: "En ligne",
				contact: { ...copy, parent: PARENT_ID },
			} as never),
			completeDeclaration({ id: 3, name: "Contact propre" }),
		]);

		expect(
			await getLinkedDeclarations(payload, OWNER, "contact", PARENT_ID),
		).toEqual([
			{ id: 1, name: "Brouillon lié", isPublished: false },
			{ id: 2, name: "En ligne", isPublished: true },
		]);
	});

	it("refuses to list another user's item", async () => {
		const { payload } = seeded("contact", [], {
			...KINDS.contact.parent,
			user: OWNER + 1,
		});

		await expect(
			getLinkedDeclarations(payload, OWNER, "contact", PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});
});

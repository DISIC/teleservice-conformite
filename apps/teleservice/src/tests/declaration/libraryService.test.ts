import type { Payload } from "payload";
import { describe, expect, it, vi } from "vitest";
import type { LibrarySectionKind } from "~/domain/declaration/sourceMode";
import {
	deleteParent,
	getLinkedDeclarations,
	linkParent,
	skipSchema,
	upsertParent,
} from "~/server/api/routers/library/service";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	completeDeclaration,
	publishedDeclaration,
} from "./declaration.fixture";

const OWNER = 1;
const PARENT_ID = 7;

/** One Library parent per kind, the copy a link writes, and an edit that touches public content. */
const KINDS = {
	contact: {
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

/** Payload stub: one Library parent, the declarations the stub knows (all returned as linked). */
function stubPayload({
	parent,
	declarations = [],
}: {
	parent: { id: number; user: number };
	declarations?: PopulatedDeclaration[];
}) {
	const rows = new Map(declarations.map((d) => [d.id, d]));
	const update = vi.fn(
		async ({
			collection,
			id,
			data,
		}: {
			collection: string;
			id: number;
			data: Record<string, unknown>;
		}) => {
			if (collection !== "declarations") return { ...parent, ...data };
			const next = { ...rows.get(id), ...data } as PopulatedDeclaration;
			rows.set(id, next);
			return next;
		},
	);
	const payload = {
		findByID: vi.fn(async () => parent),
		find: vi.fn(async ({ collection }: { collection: string }) =>
			collection === "declarations"
				? { docs: declarations, totalDocs: declarations.length }
				: { docs: [parent], totalDocs: 1 },
		),
		update,
		create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
			id: 99,
			...data,
		})),
		delete: vi.fn(async ({ id }: { id: number }) => ({ id })),
	};
	return { payload: payload as unknown as Payload, ...payload };
}

/** The declaration rows written by the stub, by declaration id. */
const writtenDeclarations = (update: ReturnType<typeof vi.fn>) =>
	new Map(
		update.mock.calls
			.map(
				(call) =>
					call[0] as {
						collection: string;
						id: number;
						data: Record<string, unknown>;
					},
			)
			.filter((call) => call.collection === "declarations")
			.map((call) => [call.id, call.data]),
	);

describe.each(KIND_LIST)("linkParent — %s", (kind) => {
	const { parent, copy } = KINDS[kind];

	it("copies the parent's content into the declaration and marks it Linked", async () => {
		const declaration = completeDeclaration();
		const { payload } = stubPayload({ parent, declarations: [declaration] });

		const result = await linkParent(
			payload,
			OWNER,
			kind,
			declaration,
			PARENT_ID,
		);

		expect(result[kind]).toEqual({
			...declaration[kind],
			...copy,
			parent: PARENT_ID,
			toVerify: false,
		});
	});

	it("turns a Publiée declaration Modifiée when the linked content differs from its snapshot", async () => {
		const declaration = publishedDeclaration();
		const { payload } = stubPayload({ parent, declarations: [declaration] });

		const result = await linkParent(
			payload,
			OWNER,
			kind,
			declaration,
			PARENT_ID,
		);

		expect(result.status).toBe("unpublished");
	});

	it("refuses a parent from another user's Library", async () => {
		const declaration = completeDeclaration();
		const { payload, update } = stubPayload({
			parent: { ...parent, user: OWNER + 1 },
			declarations: [declaration],
		});

		await expect(
			linkParent(payload, OWNER, kind, declaration, PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(update).not.toHaveBeenCalled();
	});
});

describe.each(KIND_LIST)("upsertParent — %s", (kind) => {
	const { parent, copy, values, publicEdit } = KINDS[kind];
	const linkedTo = (id: number, group: Record<string, unknown> = {}) =>
		completeDeclaration({
			id,
			[kind]: { ...copy, parent: PARENT_ID, ...group },
		} as never);

	it("creates a new item for the caller and propagates nothing", async () => {
		const { payload, create, update } = stubPayload({ parent });

		await upsertParent(payload, OWNER, kind, values);

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({ data: { ...values, user: OWNER } }),
		);
		expect(update).not.toHaveBeenCalled();
	});

	it("fans an edit out to every linked copy and clears their review flag", async () => {
		const { payload, update } = stubPayload({
			parent,
			declarations: [linkedTo(1), linkedTo(2, { toVerify: true })],
		});

		const result = await upsertParent(
			payload,
			OWNER,
			kind,
			{ ...values, ...publicEdit },
			PARENT_ID,
		);

		expect(result).toMatchObject(publicEdit);
		const written = writtenDeclarations(update);
		expect([...written.keys()]).toEqual([1, 2]);
		for (const data of written.values()) {
			expect(data[kind]).toEqual({
				...copy,
				...publicEdit,
				parent: PARENT_ID,
				toVerify: false,
			});
		}
	});

	it("turns a linked Publiée declaration Modifiée in the same write", async () => {
		const declaration = publishedDeclaration({
			[kind]: { ...copy, parent: PARENT_ID },
		} as never);
		const { payload, update } = stubPayload({
			parent,
			declarations: [declaration],
		});

		await upsertParent(
			payload,
			OWNER,
			kind,
			{ ...values, ...publicEdit },
			PARENT_ID,
		);

		expect(writtenDeclarations(update).get(declaration.id)?.status).toBe(
			"unpublished",
		);
	});

	it("refuses to edit another user's item", async () => {
		const { payload, update } = stubPayload({
			parent: { ...parent, user: OWNER + 1 },
			declarations: [linkedTo(1)],
		});

		await expect(
			upsertParent(payload, OWNER, kind, values, PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(update).not.toHaveBeenCalled();
	});
});

describe("upsertParent — what stays private", () => {
	it("renaming a contact leaves a linked Publiée declaration clean, the name is never public", async () => {
		const { parent, copy, values } = KINDS.contact;
		const declaration = publishedDeclaration({
			contact: { ...copy, parent: PARENT_ID },
		} as never);
		const { payload, update } = stubPayload({
			parent,
			declarations: [declaration],
		});

		await upsertParent(
			payload,
			OWNER,
			"contact",
			{ ...values, name: "Référent renommé" },
			PARENT_ID,
		);

		const data = writtenDeclarations(update).get(declaration.id);
		expect(data?.contact).toMatchObject({ name: "Référent renommé" });
		expect(data).not.toHaveProperty("status");
	});
});

describe.each(KIND_LIST)("deleteParent — %s", (kind) => {
	const { parent, copy } = KINDS[kind];

	it("detaches every linked copy but keeps its content, then deletes the item", async () => {
		const declaration = publishedDeclaration({
			[kind]: { ...copy, parent: PARENT_ID },
		} as never);
		const {
			payload,
			update,
			delete: remove,
		} = stubPayload({
			parent,
			declarations: [declaration],
		});

		await deleteParent(payload, OWNER, kind, PARENT_ID);

		const data = writtenDeclarations(update).get(declaration.id);
		expect(data?.[kind]).toEqual({ ...copy, parent: null });
		// Detaching changes nothing public: the Publiée row stays clean.
		expect(data).not.toHaveProperty("status");
		expect(remove).toHaveBeenCalledWith(
			expect.objectContaining({ id: PARENT_ID }),
		);
	});

	it("refuses to delete another user's item", async () => {
		const {
			payload,
			update,
			delete: remove,
		} = stubPayload({
			parent: { ...parent, user: OWNER + 1 },
		});

		await expect(
			deleteParent(payload, OWNER, kind, PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(update).not.toHaveBeenCalled();
		expect(remove).not.toHaveBeenCalled();
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
		const declaration = completeDeclaration({ schema: customSchema } as never);
		const { payload } = stubPayload({
			parent: KINDS.schema.parent,
			declarations: [declaration],
		});

		const result = await skipSchema(payload, declaration);

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
		const declaration = publishedDeclaration({ schema: customSchema } as never);
		const { payload } = stubPayload({
			parent: KINDS.schema.parent,
			declarations: [declaration],
		});

		const result = await skipSchema(payload, declaration);

		expect(result.status).toBe("unpublished");
	});
});

describe("getLinkedDeclarations", () => {
	it("lists each linked declaration with whether it is Publiée, for the warning modal", async () => {
		const { payload } = stubPayload({
			parent: KINDS.contact.parent,
			declarations: [
				completeDeclaration({ id: 1, name: "Brouillon lié" }),
				publishedDeclaration({ id: 2, name: "En ligne" }),
			],
		});

		expect(
			await getLinkedDeclarations(payload, OWNER, "contact", PARENT_ID),
		).toEqual([
			{ id: 1, name: "Brouillon lié", isPublished: false },
			{ id: 2, name: "En ligne", isPublished: true },
		]);
	});

	it("refuses to list another user's item", async () => {
		const { payload } = stubPayload({
			parent: { ...KINDS.contact.parent, user: OWNER + 1 },
		});

		await expect(
			getLinkedDeclarations(payload, OWNER, "contact", PARENT_ID),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});
});

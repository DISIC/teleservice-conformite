import type { Payload } from "payload";
import { describe, expect, it, vi } from "vitest";
import { NO_AUDIT } from "~/domain/declaration/published/noAudit";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { saveSection } from "~/server/api/utils/section-write";
import {
	completeDeclaration,
	publishedDeclaration,
} from "./declaration.fixture";

function stubPayload() {
	const update = vi
		.fn()
		.mockImplementation(
			async ({ data }: { data: Partial<PopulatedDeclaration> }) => ({
				...current,
				...data,
			}),
		);
	let current: PopulatedDeclaration = completeDeclaration();
	return {
		payload: { update } as unknown as Payload,
		update,
		on(declaration: PopulatedDeclaration) {
			current = declaration;
			return declaration;
		},
	};
}

const writtenData = (update: ReturnType<typeof vi.fn>) =>
	(update.mock.calls[0] as [{ data: Record<string, unknown> }])[0].data;

describe("saveSection — one write, status derived from the row as written", () => {
	it("writes a draft's merged group once and leaves the status column alone", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(completeDeclaration());

		await saveSection(payload, declaration, "contact", {
			name: "Référent",
			email: "b@example.fr",
		});

		expect(update).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenCalledWith(
			expect.objectContaining({ collection: "declarations", id: 1 }),
		);
		const data = writtenData(update);
		expect(data).not.toHaveProperty("status");
		expect(data.contact).toMatchObject({
			name: "Référent",
			email: "b@example.fr",
			parent: null,
			toVerify: false,
		});
	});

	it("turns a Publiée declaration Modifiée in the same write when public content drifts", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(publishedDeclaration());

		const result = await saveSection(payload, declaration, "contact", {
			email: "autre@example.fr",
		});

		expect(update).toHaveBeenCalledTimes(1);
		expect(writtenData(update).status).toBe("unpublished");
		expect(result.status).toBe("unpublished");
	});

	it("does not write a status when the edit stays outside the public snapshot", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(publishedDeclaration());

		await saveSection(payload, declaration, "contact", {
			name: "Autre référent",
		});

		expect(writtenData(update)).not.toHaveProperty("status");
	});

	it("restores Publiée when an edit brings the row back to its snapshot", async () => {
		const { payload, update, on } = stubPayload();
		const published = publishedDeclaration();
		const declaration = on({
			...published,
			status: "unpublished",
			contact: { ...published.contact, email: "drift@example.fr" },
		});

		const result = await saveSection(payload, declaration, "contact", {
			email: "a11y@example.fr",
		});

		expect(writtenData(update).status).toBe("published");
		expect(result.status).toBe("published");
	});

	it("returns the declaration as written", async () => {
		const { payload, on } = stubPayload();
		const declaration = on(completeDeclaration());

		const result = await saveSection(payload, declaration, "contact", {
			email: "b@example.fr",
		});

		expect(result.contact.email).toBe("b@example.fr");
		expect(result.entity).toEqual(declaration.entity);
	});
});

describe("audit merge rules", () => {
	const realised = () =>
		completeDeclaration({
			audit: {
				isRealised: true,
				date: "2026-01-10",
				realisedBy: "Cabinet",
				rgaa_version: "rgaa_4",
				rate: 80,
				compliantElements: "Titres",
				nonCompliantElements: "Contrastes",
				usedTools: [{ name: "axe" }],
				testEnvironments: [{ name: "firefox" }],
				toVerify: true,
			},
		} as never);

	it("merges one Sub-section slice without touching the others", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(realised());

		await saveSection(payload, declaration, "audit", {
			compliantElements: "Titres et images",
		});

		expect(writtenData(update).audit).toMatchObject({
			isRealised: true,
			rate: 80,
			compliantElements: "Titres et images",
			nonCompliantElements: "Contrastes",
			usedTools: [{ name: "axe" }],
			toVerify: false,
		});
	});

	it("stores list slices as Payload rows and an empty date as null", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(realised());

		await saveSection(payload, declaration, "audit", {
			date: "",
			usedTools: ["nvda", "axe"],
			testEnvironments: [],
		});

		expect(writtenData(update).audit).toMatchObject({
			date: null,
			usedTools: [{ name: "nvda" }, { name: "axe" }],
			testEnvironments: [],
		});
	});

	it("clears non-conformities for a fully conformant audit", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(realised());

		await saveSection(payload, declaration, "audit", { rate: 100 });

		expect(writtenData(update).audit).toMatchObject({
			rate: 100,
			nonCompliantElements: null,
		});
	});

	it("purges every detail when the audit is declared non réalisé", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(realised());

		await saveSection(payload, declaration, "audit", { isRealised: false });

		expect(writtenData(update).audit).toEqual({ ...NO_AUDIT, toVerify: false });
	});
});

describe("infos merge rules", () => {
	const general = {
		organisation: "DINUM",
		domain: "Protection sociale",
		name: "Mon service",
		url: "https://www.example.fr",
		firstPublishedAt: "2026-08-01",
	};

	it("keeps the saved name when autosave sends an empty one", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(completeDeclaration());

		await saveSection(payload, declaration, "infos", {
			...general,
			name: "",
			url: "",
		});

		const data = writtenData(update);
		expect(data).not.toHaveProperty("name");
		expect(data).not.toHaveProperty("app_kind");
		expect(data.url).toBe("");
	});

	it("stores the mobile platform only for a mobile app", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(completeDeclaration());

		await saveSection(payload, declaration, "infos", {
			...general,
			kind: "mobile_app",
			mobilePlatform: "ios",
		});
		expect(writtenData(update)).toMatchObject({
			app_kind: "mobile_app",
			mobile_platform: "ios",
		});

		update.mockClear();
		await saveSection(payload, declaration, "infos", {
			...general,
			kind: "website",
			mobilePlatform: "ios",
		});
		expect(writtenData(update)).toMatchObject({
			app_kind: "website",
			mobile_platform: null,
		});
	});

	it("writes the initial publication date for a draft and freezes it once published", async () => {
		const { payload, update, on } = stubPayload();

		await saveSection(payload, on(completeDeclaration()), "infos", {
			...general,
			firstPublishedAt: "2024-03-24",
		});
		expect(writtenData(update).first_published_at).toBe("2024-03-24");

		update.mockClear();
		await saveSection(payload, on(publishedDeclaration()), "infos", {
			...general,
			firstPublishedAt: "2024-03-24",
		});
		expect(writtenData(update)).not.toHaveProperty("first_published_at");
	});
});

describe("library section merge rules", () => {
	it("a custom contact save detaches the Library parent and clears the review flag", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(
			completeDeclaration({
				contact: {
					name: "Lié",
					email: "lie@example.fr",
					parent: 7,
					toVerify: true,
				},
			} as never),
		);

		await saveSection(payload, declaration, "contact", { name: "Propre" });

		expect(writtenData(update).contact).toEqual({
			name: "Propre",
			email: "lie@example.fr",
			parent: null,
			toVerify: false,
		});
	});

	it("a custom schema save leaves the Skipped choice", async () => {
		const { payload, update, on } = stubPayload();
		const declaration = on(completeDeclaration());

		await saveSection(payload, declaration, "schema", {
			name: "Schéma 2026-2028",
			url: "",
			actionPlanUrls: [],
		});

		expect(writtenData(update).schema).toMatchObject({
			name: "Schéma 2026-2028",
			skipped: false,
			parent: null,
			toVerify: false,
		});
	});
});

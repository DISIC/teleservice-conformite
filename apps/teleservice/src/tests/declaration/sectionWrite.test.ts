import { describe, expect, it, vi } from "vitest";
import { NO_AUDIT } from "~/domain/declaration/published/noAudit";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	saveSection,
	writeDeclaration,
} from "~/server/api/utils/section-write";
import { fakePayload } from "../payload.fake";
import {
	completeDeclaration,
	publishedDeclaration,
} from "./declaration.fixture";

const seeded = (declaration: PopulatedDeclaration) =>
	fakePayload({ declarations: [declaration] });

describe("saveSection — one write, status derived from the row as written", () => {
	it("merges a draft's patch into its group and keeps it Brouillon", async () => {
		const declaration = completeDeclaration();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "contact", {
			name: "Référent",
			email: "b@example.fr",
		});

		expect(result.contact).toMatchObject({
			name: "Référent",
			email: "b@example.fr",
			parent: null,
			toVerify: false,
		});
		expect(result.status).toBe("unpublished");
	});

	it("turns a Publiée declaration Modifiée in the same write when public content drifts", async () => {
		const declaration = publishedDeclaration();
		const { payload, read } = seeded(declaration);
		const update = vi.spyOn(payload, "update");

		const result = await saveSection(payload, declaration, "contact", {
			email: "autre@example.fr",
		});

		expect(update).toHaveBeenCalledTimes(1);
		expect(result.status).toBe("unpublished");
		expect(read("declarations", 1)).toMatchObject({
			status: "unpublished",
			contact: { email: "autre@example.fr" },
		});
	});

	it("keeps a Publiée declaration clean when the edit stays outside the public snapshot", async () => {
		const declaration = publishedDeclaration();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "contact", {
			name: "Autre référent",
		});

		expect(result.contact?.name).toBe("Autre référent");
		expect(result.status).toBe("published");
	});

	it("restores Publiée when an edit brings the row back to its snapshot", async () => {
		const published = publishedDeclaration();
		const declaration = {
			...published,
			status: "unpublished" as const,
			contact: { ...published.contact, email: "drift@example.fr" },
		};
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "contact", {
			email: "a11y@example.fr",
		});

		expect(result.status).toBe("published");
	});

	it("returns the declaration as written", async () => {
		const declaration = completeDeclaration();
		const { payload, read } = seeded(declaration);

		const result = await saveSection(payload, declaration, "contact", {
			email: "b@example.fr",
		});

		expect(result.contact?.email).toBe("b@example.fr");
		expect(result.entity).toEqual(declaration.entity);
		expect(read("declarations", 1)).toEqual(result);
	});
});

describe("writeDeclaration — direct row writes", () => {
	it("turns a Publiée declaration Modifiée when its name changes", async () => {
		const declaration = publishedDeclaration();
		const { payload } = seeded(declaration);

		const result = await writeDeclaration(payload, declaration, {
			name: "Nouveau nom",
		});

		expect(result).toMatchObject({
			name: "Nouveau nom",
			status: "unpublished",
		});
	});
});

describe("audit merge rules", () => {
	const realised = () =>
		completeDeclaration({
			audit: {
				isRealised: true,
				date: "2026-01-10",
				realisedBy: "Cabinet",
				rgaa_version: "rgaa_5",
				rate: 80,
				hasBlockingElements: true,
				blockingElements: "Navigation au clavier impossible",
				compliantElements: "Titres",
				nonCompliantElements: "Contrastes",
				usedTools: [{ name: "axe" }],
				testEnvironments: [{ name: "firefox" }],
				toVerify: true,
			},
		} as never);

	it("merges one Sub-section slice without touching the others", async () => {
		const declaration = realised();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "audit", {
			compliantElements: "Titres et images",
		});

		expect(result.audit).toMatchObject({
			isRealised: true,
			rate: 80,
			compliantElements: "Titres et images",
			nonCompliantElements: "Contrastes",
			usedTools: [{ name: "axe" }],
			toVerify: false,
		});
	});

	it("stores list slices as Payload rows and an empty date as null", async () => {
		const declaration = realised();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "audit", {
			date: "",
			usedTools: ["nvda", "axe"],
			testEnvironments: [],
		});

		expect(result.audit).toMatchObject({
			date: null,
			usedTools: [{ name: "nvda" }, { name: "axe" }],
			testEnvironments: [],
		});
	});

	it("clears non-conformities for a fully conformant audit", async () => {
		const declaration = realised();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "audit", {
			rate: 100,
		});

		expect(result.audit).toMatchObject({
			rate: 100,
			nonCompliantElements: null,
		});
	});

	it("drops the blocking elements when the audit falls back to RGAA 4", async () => {
		const declaration = realised();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "audit", {
			rgaa_version: "rgaa_4",
		});

		expect(result.audit).toMatchObject({
			hasBlockingElements: null,
			blockingElements: null,
		});
	});

	it("drops the blocking elements when the audit reports none", async () => {
		const declaration = realised();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "audit", {
			rgaa_version: "rgaa_5",
			hasBlockingElements: false,
		});

		expect(result.audit).toMatchObject({
			hasBlockingElements: false,
			blockingElements: null,
		});
	});

	it("purges every detail when the audit is declared non réalisé", async () => {
		const declaration = realised();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "audit", {
			isRealised: false,
		});

		expect(result.audit).toEqual({ ...NO_AUDIT, toVerify: false });
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

	it("writes the domain on the declaration row", async () => {
		const declaration = completeDeclaration({ domain: null });
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "infos", general);

		expect(result.domain).toBe("Protection sociale");
	});

	it("keeps the saved name, type and domain when autosave sends them empty", async () => {
		const declaration = completeDeclaration();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "infos", {
			...general,
			name: "",
			domain: "",
			url: "",
		});

		expect(result).toMatchObject({
			name: "Mon service",
			app_kind: "website",
			domain: "Protection sociale",
			url: "",
		});
	});

	it("stores the mobile platform only for a mobile app", async () => {
		const declaration = completeDeclaration();
		const { payload } = seeded(declaration);

		const mobile = await saveSection(payload, declaration, "infos", {
			...general,
			kind: "mobile_app",
			mobilePlatform: "ios",
		});
		expect(mobile).toMatchObject({
			app_kind: "mobile_app",
			mobile_platform: "ios",
		});

		const website = await saveSection(payload, mobile, "infos", {
			...general,
			kind: "website",
			mobilePlatform: "ios",
		});
		expect(website).toMatchObject({
			app_kind: "website",
			mobile_platform: null,
		});
	});

	it("writes the initial publication date for a draft and freezes it once published", async () => {
		const draft = completeDeclaration();
		const savedDraft = await saveSection(
			seeded(draft).payload,
			draft,
			"infos",
			{ ...general, firstPublishedAt: "2024-03-24" },
		);
		expect(savedDraft.first_published_at).toBe("2024-03-24");

		const published = publishedDeclaration();
		const savedPublished = await saveSection(
			seeded(published).payload,
			published,
			"infos",
			{ ...general, firstPublishedAt: "2024-03-24" },
		);
		expect(savedPublished.first_published_at).toBe(
			published.first_published_at,
		);
	});
});

describe("library section merge rules", () => {
	it("a custom contact save detaches the Library parent and clears the review flag", async () => {
		const declaration = completeDeclaration({
			contact: {
				name: "Lié",
				email: "lie@example.fr",
				parent: 7,
				toVerify: true,
			},
		} as never);
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "contact", {
			name: "Propre",
		});

		expect(result.contact).toEqual({
			name: "Propre",
			email: "lie@example.fr",
			parent: null,
			toVerify: false,
		});
	});

	it("a custom schema save leaves the Skipped choice", async () => {
		const declaration = completeDeclaration();
		const { payload } = seeded(declaration);

		const result = await saveSection(payload, declaration, "schema", {
			name: "Schéma 2026-2028",
			url: "",
			actionPlanUrls: [],
		});

		expect(result.schema).toMatchObject({
			name: "Schéma 2026-2028",
			skipped: false,
			parent: null,
			toVerify: false,
		});
	});
});

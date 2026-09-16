import { readFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildModel } from "~/build";
import { readSources } from "~/read";
import { CriteresFile, GlossaireFile } from "~/schema/published";
import { serialize, toPublished, writePublished } from "~/write";
import { VALID_TREE, writeTree } from "./fixtures";

const OPTIONS = {
	version: "5.0",
	date: "2027-01-15",
	baseUrl: "https://example.test",
	source: "https://github.com/x/y",
};

function published() {
	const { tree } = readSources(writeTree(VALID_TREE));
	return toPublished(buildModel(tree).model, OPTIONS);
}

describe("toPublished", () => {
	it("writes the header, the url templates and the Référentiels", () => {
		const { criteres, glossaire } = published();
		expect(criteres.rgaa).toEqual({ version: "5.0", date: "2027-01-15" });
		expect(criteres.source).toBe("https://github.com/x/y");
		expect(criteres.urls).toEqual({
			criterion: "https://example.test/rgaa/{referentiel}/criteres#{number}",
			test: "https://example.test/rgaa/{referentiel}/criteres#{number}",
			term: "https://example.test/rgaa/glossaire#{slug}",
		});
		expect(criteres.referentiels.map((r) => r.id)).toEqual([
			"web",
			"mobile",
			"bureautique",
		]);
		expect(glossaire.rgaa).toEqual(criteres.rgaa);
	});

	it("absolutizes glossary links in every markdown field", () => {
		const { criteres, glossaire } = published();
		const term = "https://example.test/rgaa/glossaire#";
		const critere = criteres.topics[0]?.criteria[0];
		expect(critere?.title).toBe(
			`Chaque [image](${term}image) a-t-elle une alternative textuelle ?`,
		);
		const web = critere?.referentiels.web;
		expect(web?.tests[0]?.title).toContain(`](${term}alternative)`);
		expect(web?.tests[1]?.conditions?.[1]).toBe(
			`Elle a une [alternative](${term}alternative).`,
		);
		expect(web?.appendix?.technicalNotes).toBe(
			`Une note sur l’[alternative](${term}alternative).`,
		);
		expect(
			glossaire.terms.find((t) => t.slug === "alternative")?.definition,
		).toBe(`Un nom accessible pour une [image](${term}image).`);
		expect(JSON.stringify([criteres, glossaire])).not.toMatch(/\]\(#/);
	});

	it("keeps criteria and terms free of null and empty arrays", () => {
		const { criteres, glossaire } = published();
		const criteria = criteres.topics.flatMap((topic) => topic.criteria);
		expect(serialize([criteria, glossaire.terms])).not.toMatch(/null|\[\]/);
	});
});

describe("writePublished", () => {
	it("writes both files under the major version and they parse back", () => {
		const dataDir = mkdtempSync(path.join(tmpdir(), "rgaa-data-"));
		const files = writePublished(dataDir, published());
		expect(files.map((f) => path.relative(dataDir, f))).toEqual([
			"5/criteres.json",
			"5/glossaire.json",
		]);
		const criteres = CriteresFile.parse(
			JSON.parse(readFileSync(files[0] ?? "", "utf8")),
		);
		const glossaire = GlossaireFile.parse(
			JSON.parse(readFileSync(files[1] ?? "", "utf8")),
		);
		expect(criteres.topics).toHaveLength(2);
		expect(glossaire.terms).toHaveLength(2);
		expect(readFileSync(files[0] ?? "", "utf8")).toMatch(/^\{\n\t"rgaa"/);
	});
});

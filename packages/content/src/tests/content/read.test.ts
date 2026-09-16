import { describe, expect, it } from "vitest";
import { readSources } from "~/read";
import { VALID_TREE, withFiles, writeTree } from "./fixtures";

function problemsOf(changes: Record<string, string | null>) {
	return readSources(withFiles(changes)).problems;
}

describe("readSources", () => {
	it("reads a valid tree without problems", () => {
		const { tree, problems } = readSources(writeTree(VALID_TREE));
		expect(problems).toEqual([]);
		expect(tree.thematiques).toEqual([
			{ number: "1", title: "Images" },
			{ number: "2", title: "Cadres" },
		]);
		expect(tree.criteres.map((c) => c.number)).toEqual(["1.1", "1.2"]);
		const web = tree.criteres[0]?.referentiels.web;
		expect(web?.annexe.references?.[0]?.reference).toBe("1.1.1");
		expect(web?.technicalNotes).toBe(
			"Une note sur l’[alternative](#alternative).",
		);
		expect(web?.tests.map((t) => t.number)).toEqual(["1", "2"]);
		expect(web?.tests[1]?.conditions).toHaveLength(2);
		expect(web?.tests[0]?.methodology).toBe(
			"1. Retrouver les images ;\n2. Vérifier l’alternative.",
		);
	});

	it("defaults a Terme to the three Référentiels", () => {
		const { tree } = readSources(writeTree(VALID_TREE));
		expect(tree.termes.find((t) => t.slug === "image")?.referentiels).toEqual([
			"web",
			"mobile",
			"bureautique",
		]);
		expect(
			tree.termes.find((t) => t.slug === "alternative")?.referentiels,
		).toEqual(["web"]);
	});

	it("reports a broken frontmatter with its line", () => {
		const problems = problemsOf({
			"criteres/1.2/web/tests/1.md":
				"---\ntitle: Test\nconditions: [oops\n---\n\n1. Vérifier.\n",
		});
		expect(problems).toHaveLength(1);
		expect(problems[0]).toMatchObject({
			file: "criteres/1.2/web/tests/1.md",
			line: 3,
		});
		expect(problems[0]?.message).toMatch(/^en-tête illisible/);
	});

	it("reports unknown frontmatter fields in French", () => {
		const problems = problemsOf({
			"criteres/1.2/web/tests/1.md":
				"---\ntitle: Test.\nsteps:\n  - a\n---\n\n1. Vérifier.\n",
		});
		expect(problems.map((p) => p.message)).toEqual([
			'Clé non reconnue : "steps"',
		]);
	});

	it("requires the reference number to be quoted", () => {
		const problems = problemsOf({
			"criteres/1.2/web/annexe.md":
				"---\nreferences:\n  - standard: WCAG 2.1\n    reference: 1.10\n    title: X\n---\n",
		});
		expect(problems[0]?.message).toBe(
			'champ « references[0].reference » : doit être une chaîne : entourez le numéro de guillemets (« "1.10" »)',
		);
	});

	it("refuses prose in annexe.md", () => {
		const problems = problemsOf({
			"criteres/1.2/web/annexe.md":
				"---\ntechniques:\n  - H67\n---\n\n#### Cas particuliers\n\nDu texte.\n",
		});
		expect(problems[0]?.message).toMatch(
			/^annexe\.md ne contient que l'en-tête/,
		);
	});

	it("refuses a frontmatter on prose-only files", () => {
		const problems = problemsOf({
			"criteres/1.2/index.md": "---\ntitle: X\n---\n\nX ?\n",
		});
		expect(problems[0]).toMatchObject({
			file: "criteres/1.2/index.md",
			message: "ce fichier ne prend pas d'en-tête : seulement du texte",
		});
	});

	it("requires a one-paragraph title, a methodology and a definition", () => {
		const problems = problemsOf({
			"criteres/1.2/index.md": "Un titre.\n\nUn second paragraphe.\n",
			"criteres/1.2/web/tests/1.md": "---\ntitle: Test.\n---\n",
			"glossaire/image.md": "---\ntitle: Image\n---\n",
		});
		expect(problems.map((p) => p.message)).toEqual([
			"l'intitulé du Critère tient en un seul paragraphe",
			"méthodologie manquante : le corps du fichier décrit comment vérifier le test",
			"définition manquante : le corps du fichier définit le Terme",
		]);
	});

	it("rejects unexpected files and misnamed folders", () => {
		const problems = problemsOf({
			"criteres/1.2/notes.md": "x\n",
			"criteres/1.2/web/tests/01.md": "---\ntitle: T\n---\n\n1. x\n",
			"criteres/1.2/web/annexe.txt": "x\n",
			"criteres/images/index.md": "x\n",
			"glossaire/Image Test.md": "---\ntitle: X\n---\n\nx\n",
		});
		expect(problems.map((p) => p.file)).toEqual([
			"criteres/1.2/notes.md",
			"criteres/1.2/web/tests/01.md",
			"criteres/1.2/web/annexe.txt",
			"criteres/images",
			"glossaire/Image Test.md",
		]);
	});

	it("reports missing required files", () => {
		const problems = problemsOf({
			"criteres/1.1/index.md": null,
			"criteres/1.1/web/annexe.md": null,
			"criteres/1.1/mobile/tests/1.md": null,
		});
		expect(problems.map((p) => `${p.file} : ${p.message}`)).toEqual([
			"criteres/1.1 : index.md manquant (intitulé du Critère)",
			"criteres/1.1/mobile : dossier tests/ manquant",
			"criteres/1.1/web : annexe.md manquant (références et techniques)",
		]);
	});
});

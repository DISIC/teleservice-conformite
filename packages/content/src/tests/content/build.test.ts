import { describe, expect, it } from "vitest";
import { buildModel } from "~/build";
import { readSources } from "~/read";
import { VALID_TREE, withFiles, writeTree } from "./fixtures";

function build(changes: Record<string, string | null> = {}) {
	const { tree, problems } = readSources(withFiles(changes));
	expect(problems).toEqual([]);
	return buildModel(tree);
}

describe("buildModel", () => {
	it("assembles the published model from a valid tree", () => {
		const { model, problems } = build();
		expect(problems).toEqual([]);
		expect(model.topics.map((t) => [t.number, t.criteria.length])).toEqual([
			["1", 2],
			["2", 0],
		]);
		const critere = model.topics[0]?.criteria[0];
		expect(critere?.number).toBe("1.1");
		expect(Object.keys(critere?.referentiels ?? {})).toEqual(["web", "mobile"]);
		expect(critere?.referentiels.web?.tests.map((t) => t.number)).toEqual([
			"1.1.1",
			"1.1.2",
		]);
		expect(critere?.referentiels.web?.appendix).toEqual({
			references: [
				{
					standard: "WCAG 2.1",
					reference: "1.1.1",
					title: "Non-text Content",
					level: "A",
				},
			],
			techniques: ["H36"],
			technicalNotes: "Une note sur l’[alternative](#alternative).",
		});
		expect(critere?.referentiels.mobile?.tests[0]?.number).toBe("1.1.1");
		expect(model.terms.map((t) => t.slug)).toEqual(["alternative", "image"]);
	});

	it("omits empty keys instead of writing null or []", () => {
		const { model } = build();
		const declinaison = model.topics[0]?.criteria[1]?.referentiels.web;
		expect(declinaison).toEqual({
			tests: [{ number: "1.2.1", title: "Test.", methodology: "1. Vérifier." }],
			appendix: { techniques: ["H67"] },
		});
		expect(JSON.stringify(model.topics[0])).not.toMatch(/null|\[\]/);
	});

	it("sorts criteria numerically so 1.10 follows 1.9", () => {
		const { model } = build({
			"criteres/1.10/index.md": "Dix ?\n",
			"criteres/1.10/web/annexe.md": "---\ntechniques:\n  - H1\n---\n",
			"criteres/1.10/web/tests/1.md": "---\ntitle: T\n---\n\n1. x\n",
			"criteres/1.9/index.md": "Neuf ?\n",
			"criteres/1.9/web/annexe.md": "---\ntechniques:\n  - H1\n---\n",
			"criteres/1.9/web/tests/1.md": "---\ntitle: T\n---\n\n1. x\n",
		});
		expect(model.topics[0]?.criteria.map((c) => c.number)).toEqual([
			"1.1",
			"1.2",
			"1.9",
			"1.10",
		]);
	});

	it("rejects a glossary link to an unknown Terme", () => {
		const { problems } = build({
			"criteres/1.2/index.md": "Chaque [zone](#zone-non-cliquable) ?\n",
		});
		expect(problems).toEqual([
			{
				file: "criteres/1.2/index.md",
				message:
					"le lien « #zone-non-cliquable » ne correspond à aucun Terme du glossaire (glossaire/zone-non-cliquable.md)",
			},
		]);
	});

	it("rejects a Terme that does not apply to the text's Référentiel", () => {
		const { problems } = build({
			"criteres/1.1/mobile/tests/1.md":
				"---\ntitle: Une [alternative](#alternative) ?\n---\n\n1. x\n",
		});
		expect(problems).toEqual([
			{
				file: "criteres/1.1/mobile/tests/1.md",
				message:
					"le Terme « alternative » ne s'applique pas au référentiel mobile",
			},
		]);
	});

	it("checks a shared title against every Référentiel of the Critère", () => {
		const { problems } = build({
			"criteres/1.1/index.md": "Une [alternative](#alternative) ?\n",
		});
		expect(problems.map((p) => p.message)).toEqual([
			"le Terme « alternative » ne s'applique pas au référentiel mobile",
		]);
	});

	it("checks glossary definitions too", () => {
		const { problems } = build({
			"glossaire/image.md":
				"---\ntitle: Image\n---\n\nVoir [alternative](#alternative).\n",
		});
		expect(problems.map((p) => p.message)).toEqual([
			"le Terme « alternative » ne s'applique pas au référentiel mobile",
			"le Terme « alternative » ne s'applique pas au référentiel bureautique",
		]);
	});

	it("requires tests numbered from 1 without gaps", () => {
		const { problems } = build({
			"criteres/1.2/web/tests/1.md": null,
			"criteres/1.2/web/tests/2.md": "---\ntitle: T\n---\n\n1. x\n",
			"criteres/1.2/web/tests/3.md": "---\ntitle: T\n---\n\n1. x\n",
		});
		expect(problems).toEqual([
			{
				file: "criteres/1.2/web/tests",
				message: "les tests sont numérotés de 1 à 2 sans trou : trouvé 2, 3",
			},
		]);
	});

	it("requires the Thématique and at least one Référentiel", () => {
		const { problems } = build({
			"criteres/3.1/index.md": "Trois ?\n",
			"criteres/1.2/web/annexe.md": null,
			"criteres/1.2/web/tests/1.md": null,
		});
		expect(problems.map((p) => `${p.file} : ${p.message}`)).toEqual([
			"criteres/1.2 : aucun dossier de Référentiel (web, mobile, bureautique) : un Critère s'applique à au moins un Référentiel",
			"criteres/3.1 : la Thématique 3 n'existe pas dans thematiques.yml",
			"criteres/3.1 : aucun dossier de Référentiel (web, mobile, bureautique) : un Critère s'applique à au moins un Référentiel",
		]);
	});

	it("rejects a Thématique declared twice", () => {
		const { problems } = build({
			"thematiques.yml":
				"- number: 1\n  title: Images\n- number: 1\n  title: Bis\n",
		});
		expect(problems).toEqual([
			{
				file: "thematiques.yml",
				message: "la Thématique 1 est déclarée deux fois",
			},
		]);
	});
});

describe("fixtures", () => {
	it("keeps VALID_TREE valid", () => {
		const { tree, problems } = readSources(writeTree(VALID_TREE));
		expect(problems).toEqual([]);
		expect(buildModel(tree).problems).toEqual([]);
	});
});

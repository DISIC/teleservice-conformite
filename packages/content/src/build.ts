import type { Problem } from "./problems";
import type {
	SourceCritere,
	SourceDeclinaison,
	SourceTerme,
	SourceTree,
} from "./read";
import {
	type Appendix,
	type Critere,
	type Declinaison,
	type ReferentielId,
	REFERENTIEL_IDS,
	type Terme,
	Thematique,
} from "./schema/published";

export type ContentModel = {
	topics: Thematique[];
	terms: Terme[];
};

const GLOSSARY_LINK = /\]\(#([^)\s]+)\)/g;

type Ctx = { problems: Problem[]; termes: Map<string, SourceTerme> };

export function buildModel(tree: SourceTree): {
	model: ContentModel;
	problems: Problem[];
} {
	const ctx: Ctx = {
		problems: [],
		termes: new Map(tree.termes.map((terme) => [terme.slug, terme])),
	};
	const thematiques = new Map<string, string>();
	for (const thematique of tree.thematiques) {
		if (thematiques.has(thematique.number)) {
			fail(
				ctx,
				"thematiques.yml",
				`la Thématique ${thematique.number} est déclarée deux fois`,
			);
		}
		thematiques.set(thematique.number, thematique.title);
	}
	for (const critere of tree.criteres) checkCritere(ctx, critere, thematiques);
	for (const terme of tree.termes)
		checkLinks(ctx, terme.definition, terme.file, terme.referentiels);

	const topics = [...thematiques]
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([number, title]) => ({
			number,
			title,
			criteria: tree.criteres
				.filter((critere) => topicOf(critere.number) === number)
				.sort((a, b) => criterionIndex(a.number) - criterionIndex(b.number))
				.map(toCritere),
		}));
	const terms = tree.termes
		.map((terme) => ({
			slug: terme.slug,
			title: terme.title,
			referentiels: terme.referentiels,
			definition: terme.definition,
		}))
		.sort((a, b) => a.slug.localeCompare(b.slug, "fr"));

	return {
		model: {
			topics: ctx.problems.length ? topics : Thematique.array().parse(topics),
			terms,
		},
		problems: ctx.problems,
	};
}

function fail(ctx: Ctx, file: string, message: string) {
	ctx.problems.push({ file, message });
}

function topicOf(number: string): string {
	return number.split(".")[0] ?? "";
}

function criterionIndex(number: string): number {
	return Number(number.split(".")[1]);
}

function checkCritere(
	ctx: Ctx,
	critere: SourceCritere,
	thematiques: Map<string, string>,
) {
	if (!thematiques.has(topicOf(critere.number))) {
		fail(
			ctx,
			critere.dir,
			`la Thématique ${topicOf(critere.number)} n'existe pas dans thematiques.yml`,
		);
	}
	const applicable = REFERENTIEL_IDS.filter((id) => critere.referentiels[id]);
	if (applicable.length === 0) {
		fail(
			ctx,
			critere.dir,
			`aucun dossier de Référentiel (${REFERENTIEL_IDS.join(", ")}) : un Critère s'applique à au moins un Référentiel`,
		);
	}
	checkLinks(ctx, critere.title, critere.file, applicable);
	for (const id of applicable) {
		const declinaison = critere.referentiels[id];
		if (declinaison) checkDeclinaison(ctx, declinaison, id);
	}
}

function checkDeclinaison(
	ctx: Ctx,
	declinaison: SourceDeclinaison,
	id: ReferentielId,
) {
	const numbers = declinaison.tests.map((test) => Number(test.number));
	if (numbers.some((number, index) => number !== index + 1)) {
		fail(
			ctx,
			`${declinaison.dir}/tests`,
			`les tests sont numérotés de 1 à ${numbers.length} sans trou : trouvé ${numbers.join(", ")}`,
		);
	}
	for (const test of declinaison.tests) {
		checkLinks(
			ctx,
			[test.title, ...(test.conditions ?? []), test.methodology].join("\n"),
			test.file,
			[id],
		);
	}
	if (declinaison.particularCases) {
		checkLinks(
			ctx,
			declinaison.particularCases,
			`${declinaison.dir}/cas-particuliers.md`,
			[id],
		);
	}
	if (declinaison.technicalNotes) {
		checkLinks(
			ctx,
			declinaison.technicalNotes,
			`${declinaison.dir}/notes-techniques.md`,
			[id],
		);
	}
}

// A glossary link is valid only if the Terme applies to every Référentiel the text is written for.
function checkLinks(
	ctx: Ctx,
	text: string,
	file: string,
	referentiels: readonly ReferentielId[],
) {
	for (const [, slug] of text.matchAll(GLOSSARY_LINK)) {
		if (slug === undefined) continue;
		const terme = ctx.termes.get(slug);
		if (!terme) {
			fail(
				ctx,
				file,
				`le lien « #${slug} » ne correspond à aucun Terme du glossaire (glossaire/${slug}.md)`,
			);
			continue;
		}
		for (const id of referentiels) {
			if (!terme.referentiels.includes(id)) {
				fail(
					ctx,
					file,
					`le Terme « ${slug} » ne s'applique pas au référentiel ${id}`,
				);
			}
		}
	}
}

function toCritere(critere: SourceCritere): Critere {
	const referentiels: Critere["referentiels"] = {};
	for (const id of REFERENTIEL_IDS) {
		const declinaison = critere.referentiels[id];
		if (declinaison)
			referentiels[id] = toDeclinaison(critere.number, declinaison);
	}
	return { number: critere.number, title: critere.title, referentiels };
}

function toDeclinaison(
	critereNumber: string,
	declinaison: SourceDeclinaison,
): Declinaison {
	const appendix: Appendix = {
		...(declinaison.annexe.references
			? { references: declinaison.annexe.references }
			: {}),
		...(declinaison.annexe.techniques
			? { techniques: declinaison.annexe.techniques }
			: {}),
		...(declinaison.particularCases
			? { particularCases: declinaison.particularCases }
			: {}),
		...(declinaison.technicalNotes
			? { technicalNotes: declinaison.technicalNotes }
			: {}),
	};
	return {
		tests: declinaison.tests.map((test) => ({
			number: `${critereNumber}.${test.number}`,
			title: test.title,
			...(test.conditions ? { conditions: test.conditions } : {}),
			methodology: test.methodology,
		})),
		...(Object.keys(appendix).length ? { appendix } : {}),
	};
}

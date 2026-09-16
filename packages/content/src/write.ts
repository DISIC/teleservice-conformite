import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ContentModel } from "./build";
import {
	type Critere,
	CriteresFile,
	type Declinaison,
	GlossaireFile,
	REFERENTIEL_IDS,
	REFERENTIEL_TITLES,
	type Test,
	type Thematique,
} from "./schema/published";

export type PublishOptions = {
	version: string;
	date?: string;
	baseUrl: string;
	source?: string;
};

export type PublishedFiles = {
	criteres: CriteresFile;
	glossaire: GlossaireFile;
};

export const DEFAULT_PUBLISH_OPTIONS: PublishOptions = {
	version: "5.0",
	baseUrl: "https://accessibilite.numerique.gouv.fr",
	source:
		"https://github.com/DISIC/teleservice-conformite/tree/main/rgaa/content",
};

const GLOSSARY_LINK = /\]\(#([^)\s]+)\)/g;

// Published texts carry absolute links: a JSON consumer has no page to resolve "#slug" against.
export function toPublished(
	model: ContentModel,
	options: PublishOptions = DEFAULT_PUBLISH_OPTIONS,
): PublishedFiles {
	const termUrl = `${options.baseUrl}/rgaa/glossaire#{slug}`;
	const absolutize = (text: string) =>
		text.replace(
			GLOSSARY_LINK,
			(_, slug: string) => `](${termUrl.replace("{slug}", slug)})`,
		);
	const header = {
		rgaa: {
			version: options.version,
			...(options.date ? { date: options.date } : {}),
		},
		...(options.source ? { source: options.source } : {}),
	};
	return {
		criteres: CriteresFile.parse({
			...header,
			urls: {
				criterion: `${options.baseUrl}/rgaa/{referentiel}/criteres#{number}`,
				test: `${options.baseUrl}/rgaa/{referentiel}/criteres#{number}`,
				term: termUrl,
			},
			referentiels: REFERENTIEL_IDS.map((id) => ({
				id,
				title: REFERENTIEL_TITLES[id],
			})),
			topics: model.topics.map((topic) => publishTopic(topic, absolutize)),
		}),
		glossaire: GlossaireFile.parse({
			...header,
			terms: model.terms.map((terme) => ({
				...terme,
				definition: absolutize(terme.definition),
			})),
		}),
	};
}

type Absolutize = (text: string) => string;

function publishTopic(topic: Thematique, absolutize: Absolutize): Thematique {
	return {
		...topic,
		criteria: topic.criteria.map((critere) =>
			publishCritere(critere, absolutize),
		),
	};
}

function publishCritere(critere: Critere, absolutize: Absolutize): Critere {
	const referentiels: Critere["referentiels"] = {};
	for (const id of REFERENTIEL_IDS) {
		const declinaison = critere.referentiels[id];
		if (declinaison)
			referentiels[id] = publishDeclinaison(declinaison, absolutize);
	}
	return { ...critere, title: absolutize(critere.title), referentiels };
}

function publishDeclinaison(
	declinaison: Declinaison,
	absolutize: Absolutize,
): Declinaison {
	const appendix = declinaison.appendix;
	return {
		tests: declinaison.tests.map((test) => publishTest(test, absolutize)),
		...(appendix
			? {
					appendix: {
						...appendix,
						...(appendix.particularCases
							? { particularCases: absolutize(appendix.particularCases) }
							: {}),
						...(appendix.technicalNotes
							? { technicalNotes: absolutize(appendix.technicalNotes) }
							: {}),
					},
				}
			: {}),
	};
}

function publishTest(test: Test, absolutize: Absolutize): Test {
	return {
		...test,
		title: absolutize(test.title),
		...(test.conditions ? { conditions: test.conditions.map(absolutize) } : {}),
		methodology: absolutize(test.methodology),
	};
}

// Tabs and a final newline match the repository formatter, so the committed files never churn.
export function serialize(value: unknown): string {
	return `${JSON.stringify(value, null, "\t")}\n`;
}

export function writePublished(
	dataDir: string,
	files: PublishedFiles,
): string[] {
	const dir = path.join(
		dataDir,
		files.criteres.rgaa.version.split(".")[0] ?? "",
	);
	mkdirSync(dir, { recursive: true });
	const entries: [string, unknown][] = [
		["criteres.json", files.criteres],
		["glossaire.json", files.glossaire],
	];
	return entries.map(([name, value]) => {
		const file = path.join(dir, name);
		writeFileSync(file, serialize(value));
		return file;
	});
}

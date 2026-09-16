import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml, YAMLParseError } from "yaml";
import * as z from "zod";
import type { Problem } from "./problems";
import { REFERENTIEL_IDS, type ReferentielId } from "./schema/published";
import {
	type Annexe,
	AnnexeFrontmatter,
	TermeFrontmatter,
	TestFrontmatter,
	ThematiquesFile,
} from "./schema/sources";

z.config(z.locales.fr());

const CRITERE_DIR = /^[1-9]\d*\.[1-9]\d*$/;
const TEST_FILE = /^([1-9]\d*)\.md$/;
const SLUG_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

export type SourceTest = {
	number: string;
	file: string;
	title: string;
	conditions?: string[];
	methodology: string;
};

export type SourceDeclinaison = {
	dir: string;
	annexe: Annexe;
	particularCases?: string;
	technicalNotes?: string;
	tests: SourceTest[];
};

export type SourceCritere = {
	number: string;
	dir: string;
	file: string;
	title: string;
	referentiels: Partial<Record<ReferentielId, SourceDeclinaison>>;
};

export type SourceTerme = {
	slug: string;
	file: string;
	title: string;
	referentiels: ReferentielId[];
	definition: string;
};

export type SourceThematique = { number: string; title: string };

export type SourceTree = {
	thematiques: SourceThematique[];
	criteres: SourceCritere[];
	termes: SourceTerme[];
};

type Ctx = { root: string; problems: Problem[] };

export function readSources(contentDir: string): {
	tree: SourceTree;
	problems: Problem[];
} {
	const ctx: Ctx = { root: contentDir, problems: [] };
	const tree: SourceTree = {
		thematiques: readThematiques(ctx),
		criteres: listDir(ctx, "criteres").flatMap((name) => {
			const critere = readCritere(ctx, name);
			return critere ? [critere] : [];
		}),
		termes: listDir(ctx, "glossaire").flatMap((name) => {
			const terme = readTerme(ctx, name);
			return terme ? [terme] : [];
		}),
	};
	return { tree, problems: ctx.problems };
}

function fail(ctx: Ctx, file: string, message: string, line?: number) {
	ctx.problems.push(
		line === undefined ? { file, message } : { file, message, line },
	);
}

function isDirectory(ctx: Ctx, file: string): boolean {
	return statSync(path.join(ctx.root, file)).isDirectory();
}

function listDir(ctx: Ctx, dir: string): string[] {
	if (!existsSync(path.join(ctx.root, dir))) {
		fail(ctx, dir, "dossier manquant");
		return [];
	}
	return readdirSync(path.join(ctx.root, dir))
		.filter((name) => !name.startsWith("."))
		.sort();
}

function readText(ctx: Ctx, file: string): string | undefined {
	try {
		return readFileSync(path.join(ctx.root, file), "utf8");
	} catch {
		fail(ctx, file, "fichier illisible");
		return undefined;
	}
}

type Document = { data: unknown; body: string; hasFrontmatter: boolean };

function splitFrontmatter(
	ctx: Ctx,
	file: string,
	text: string,
): Document | undefined {
	if (!text.startsWith("---"))
		return { data: undefined, body: text, hasFrontmatter: false };
	const match = FRONTMATTER.exec(text);
	if (!match) {
		fail(ctx, file, "en-tête ouvert par « --- » mais jamais refermé", 1);
		return undefined;
	}
	try {
		return {
			data: parseYaml(match[1] ?? ""),
			body: match[2] ?? "",
			hasFrontmatter: true,
		};
	} catch (error) {
		const line =
			error instanceof YAMLParseError ? error.linePos?.[0]?.line : undefined;
		const detail =
			error instanceof Error ? (error.message.split("\n")[0] ?? "") : "";
		fail(
			ctx,
			file,
			`en-tête illisible : ${detail}`,
			line === undefined ? undefined : line + 1,
		);
		return undefined;
	}
}

function formatPath(issuePath: PropertyKey[]): string {
	return issuePath
		.map((segment) =>
			typeof segment === "number" ? `[${segment}]` : `.${String(segment)}`,
		)
		.join("")
		.replace(/^\./, "");
}

function parseWith<T>(
	ctx: Ctx,
	file: string,
	schema: z.ZodType<T>,
	data: unknown,
): T | undefined {
	const result = schema.safeParse(data ?? {});
	if (result.success) return result.data;
	for (const issue of result.error.issues) {
		const field = issue.path.length
			? `champ « ${formatPath(issue.path)} » : `
			: "";
		fail(ctx, file, `${field}${issue.message}`);
	}
	return undefined;
}

function readFrontmatterFile<T>(
	ctx: Ctx,
	file: string,
	schema: z.ZodType<T>,
): { data: T; body: string } | undefined {
	const text = readText(ctx, file);
	if (text === undefined) return undefined;
	const doc = splitFrontmatter(ctx, file, text);
	if (!doc) return undefined;
	if (!doc.hasFrontmatter) {
		fail(
			ctx,
			file,
			"en-tête manquant : le fichier commence par un bloc « --- »",
		);
		return undefined;
	}
	const data = parseWith(ctx, file, schema, doc.data);
	return data === undefined ? undefined : { data, body: doc.body.trim() };
}

function readProse(ctx: Ctx, file: string): string | undefined {
	const text = readText(ctx, file);
	if (text === undefined) return undefined;
	const doc = splitFrontmatter(ctx, file, text);
	if (!doc) return undefined;
	if (doc.hasFrontmatter) {
		fail(ctx, file, "ce fichier ne prend pas d'en-tête : seulement du texte");
		return undefined;
	}
	const body = doc.body.trim();
	if (!body) {
		fail(ctx, file, "fichier vide");
		return undefined;
	}
	return body;
}

function readThematiques(ctx: Ctx): SourceThematique[] {
	const file = "thematiques.yml";
	const text = readText(ctx, file);
	if (text === undefined) return [];
	try {
		return parseWith(ctx, file, ThematiquesFile, parseYaml(text)) ?? [];
	} catch (error) {
		const line =
			error instanceof YAMLParseError ? error.linePos?.[0]?.line : undefined;
		fail(
			ctx,
			file,
			`fichier illisible : ${error instanceof Error ? error.message.split("\n")[0] : ""}`,
			line,
		);
		return [];
	}
}

function readCritere(ctx: Ctx, name: string): SourceCritere | undefined {
	const dir = `criteres/${name}`;
	if (!CRITERE_DIR.test(name) || !isDirectory(ctx, dir)) {
		fail(
			ctx,
			dir,
			"nom invalide : un Critère est un dossier nommé par son numéro (1.1, 1.2, 2.10…)",
		);
		return undefined;
	}
	const entries = listDir(ctx, dir);
	const file = `${dir}/index.md`;
	let title: string | undefined;
	if (!entries.includes("index.md"))
		fail(ctx, dir, "index.md manquant (intitulé du Critère)");
	else {
		title = readProse(ctx, file);
		if (title && /\n\s*\n/.test(title))
			fail(ctx, file, "l'intitulé du Critère tient en un seul paragraphe");
	}
	const referentiels: SourceCritere["referentiels"] = {};
	for (const entry of entries) {
		if (entry === "index.md") continue;
		const ref = REFERENTIEL_IDS.find((id) => id === entry);
		if (ref && isDirectory(ctx, `${dir}/${entry}`)) {
			const declinaison = readDeclinaison(ctx, `${dir}/${entry}`);
			if (declinaison) referentiels[ref] = declinaison;
		} else {
			fail(
				ctx,
				`${dir}/${entry}`,
				`fichier inattendu : un dossier de Critère contient index.md et un dossier par Référentiel (${REFERENTIEL_IDS.join(", ")})`,
			);
		}
	}
	return title === undefined
		? undefined
		: { number: name, dir, file, title, referentiels };
}

function readDeclinaison(ctx: Ctx, dir: string): SourceDeclinaison | undefined {
	const entries = listDir(ctx, dir);
	let annexe: Annexe | undefined;
	if (!entries.includes("annexe.md"))
		fail(ctx, dir, "annexe.md manquant (références et techniques)");
	else annexe = readAnnexe(ctx, `${dir}/annexe.md`);
	const particularCases = entries.includes("cas-particuliers.md")
		? readProse(ctx, `${dir}/cas-particuliers.md`)
		: undefined;
	const technicalNotes = entries.includes("notes-techniques.md")
		? readProse(ctx, `${dir}/notes-techniques.md`)
		: undefined;
	let tests: SourceTest[] | undefined;
	if (!entries.includes("tests") || !isDirectory(ctx, `${dir}/tests`))
		fail(ctx, dir, "dossier tests/ manquant");
	else tests = readTests(ctx, `${dir}/tests`);
	for (const entry of entries) {
		if (
			[
				"annexe.md",
				"cas-particuliers.md",
				"notes-techniques.md",
				"tests",
			].includes(entry)
		)
			continue;
		fail(
			ctx,
			`${dir}/${entry}`,
			"fichier inattendu : un dossier de Référentiel contient annexe.md, tests/ et, au besoin, cas-particuliers.md et notes-techniques.md",
		);
	}
	if (!annexe || !tests) return undefined;
	return {
		dir,
		annexe,
		...(particularCases === undefined ? {} : { particularCases }),
		...(technicalNotes === undefined ? {} : { technicalNotes }),
		tests,
	};
}

function readAnnexe(ctx: Ctx, file: string): Annexe | undefined {
	const doc = readFrontmatterFile(ctx, file, AnnexeFrontmatter);
	if (!doc) return undefined;
	if (doc.body) {
		fail(
			ctx,
			file,
			"annexe.md ne contient que l'en-tête : les cas particuliers vont dans cas-particuliers.md, les notes techniques dans notes-techniques.md",
		);
		return undefined;
	}
	return doc.data;
}

function readTests(ctx: Ctx, dir: string): SourceTest[] | undefined {
	const tests: SourceTest[] = [];
	let failed = false;
	for (const entry of listDir(ctx, dir)) {
		const file = `${dir}/${entry}`;
		const match = TEST_FILE.exec(entry);
		if (!match || isDirectory(ctx, file)) {
			fail(ctx, file, "nom invalide : les tests se nomment 1.md, 2.md, 3.md…");
			failed = true;
			continue;
		}
		const doc = readFrontmatterFile(ctx, file, TestFrontmatter);
		if (!doc) {
			failed = true;
			continue;
		}
		if (!doc.body) {
			fail(
				ctx,
				file,
				"méthodologie manquante : le corps du fichier décrit comment vérifier le test",
			);
			failed = true;
			continue;
		}
		tests.push({
			number: match[1] ?? "",
			file,
			title: doc.data.title,
			...(doc.data.conditions ? { conditions: doc.data.conditions } : {}),
			methodology: doc.body,
		});
	}
	if (failed) return undefined;
	if (tests.length === 0) {
		fail(
			ctx,
			dir,
			"au moins un test est requis : un Référentiel présent sans test n'a pas de sens",
		);
		return undefined;
	}
	return tests.sort((a, b) => Number(a.number) - Number(b.number));
}

function readTerme(ctx: Ctx, name: string): SourceTerme | undefined {
	const file = `glossaire/${name}`;
	if (!SLUG_FILE.test(name) || isDirectory(ctx, file)) {
		fail(
			ctx,
			file,
			"nom invalide : un Terme est un fichier <slug>.md en minuscules, chiffres et tirets",
		);
		return undefined;
	}
	const doc = readFrontmatterFile(ctx, file, TermeFrontmatter);
	if (!doc) return undefined;
	if (!doc.body) {
		fail(
			ctx,
			file,
			"définition manquante : le corps du fichier définit le Terme",
		);
		return undefined;
	}
	return {
		slug: name.slice(0, -".md".length),
		file,
		title: doc.data.title,
		referentiels: doc.data.referentiels ?? [...REFERENTIEL_IDS],
		definition: doc.body,
	};
}

import "server-only";

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { slugify } from "markdown-to-jsx";

// Editorial pages are markdown in rgaa/<name>/<name>.md, read at build time by the static export.
const CONTENT_DIR = path.join(process.cwd(), "..", "..", "rgaa");

// The hero already renders the page title as the only h1.
const LEADING_TITLE = /^#\s+.*\n+/;
const SECTION_TITLE = /^##[^\S\n]+(.+)$/gm;

export type MarkdownHeading = { id: string; label: string };
export type MarkdownSection = MarkdownHeading & { body: string };

export function readMarkdownPage(name: string): string {
	const file = path.join(CONTENT_DIR, name, `${name}.md`);
	return readFileSync(file, "utf8").replace(LEADING_TITLE, "");
}

// Each h2 becomes its own section; anchors use the ids markdown-to-jsx derives from the same headings.
export function splitSections(markdown: string): MarkdownSection[] {
	const titles = [...markdown.matchAll(SECTION_TITLE)];

	return titles.map((title, index) => {
		const label = title[1] ?? "";
		const start = (title.index ?? 0) + title[0].length;
		const end = titles[index + 1]?.index ?? markdown.length;

		return {
			id: slugify(label),
			label,
			body: markdown.slice(start, end).trim(),
		};
	});
}

// Release notes are one file per version, named …-4-1-2.md; a missing segment means 0 (4.1 is 4.1.0).
const FILE_VERSION = /(\d+(?:-\d+)*)\.md$/;

function versionRank(file: string): number {
	const [major = 0, minor = 0, patch = 0] = (FILE_VERSION.exec(file)?.[1] ?? "")
		.split("-")
		.map(Number);

	return major * 1e6 + minor * 1e3 + patch;
}

// One page per directory, newest version first.
export function readVersionedMarkdown(name: string): string {
	const dir = path.join(CONTENT_DIR, name);

	return readdirSync(dir)
		.filter((file) => file.endsWith(".md"))
		.sort((a, b) => versionRank(b) - versionRank(a))
		.map((file) => readFileSync(path.join(dir, file), "utf8").trim())
		.join("\n\n");
}

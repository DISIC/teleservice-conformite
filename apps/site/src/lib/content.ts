import "server-only";

import { readFileSync } from "node:fs";
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

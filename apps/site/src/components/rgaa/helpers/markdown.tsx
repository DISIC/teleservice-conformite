import { Fragment, type ReactNode } from "react";
import { slugify } from "~/lib/slugify";
import Code from "./Code";

// Every published string (titles, conditions, méthodologies, annexes) is markdown: links, inline code, bold, lists.
// Glossary definitions also carry language spans and bare autolinks.
const INLINE =
	/\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|<span lang="([^"]+)">(.+?)<\/span>|<(https?:\/\/[^>\s]+)>/g;
const LIST_ITEM = /^[-*]\s+/;
const ORDERED_ITEM = /^\d+\.\s+/;
// Editorial pages split on h2 upstream, so only sub-headings reach the renderer.
const HEADING = /^(#{3,6})\s+(.+)$/;
// Markdown hard line break: a trailing backslash or two trailing spaces.
const HARD_BREAK = /\\$|\s{2,}$/;
// A line holding only {{name}} is replaced by the matching block from the caller.
const BLOCK_PLACEHOLDER = /^\{\{\s*([a-z0-9-]+)\s*\}\}$/;
// Editors style a paragraph with a DSFR class (e.g. fr-text--lead) by writing it as one-line HTML.
const CLASSED_PARAGRAPH = /^<p class="([^"]+)">(.*)<\/p>$/;

type ListItem = { text: string; children: string[] };
type List = { ordered: boolean; items: ListItem[] };

// Attributes and accessible names take text, never elements.
export function toPlainText(source: string): string {
	return source.replace(
		INLINE,
		(_, linkText, __, code, bold, ___, spanText, autolink) =>
			[linkText, code, bold, spanText && toPlainText(spanText), autolink].find(
				(value) => value !== undefined,
			),
	);
}

// Joined source lines keep a "\n" where the author asked for a hard break.
const joinLines = (text: string, next: string) =>
	text.endsWith("\n") ? text + next : `${text} ${next}`;

export function renderMarkdownInline(text: string): ReactNode[] {
	const lines = text.replace(/\n+$/, "").split("\n");
	if (lines.length > 1)
		return lines.flatMap((line, index) => [
			...(index > 0 ? [<br key={`br${index}`} />] : []),
			...renderMarkdownInline(line),
		]);

	const nodes: ReactNode[] = [];
	let cursor = 0;

	for (const match of text.matchAll(INLINE)) {
		const [raw, linkText, href, code, bold, lang, spanText, autolink] = match;
		const start = match.index;

		if (start > cursor) nodes.push(text.slice(cursor, start));
		if (linkText && href)
			nodes.push(
				<a key={`${start}`} href={href}>
					{linkText}
				</a>,
			);
		else if (code) nodes.push(<Code key={`${start}`}>{code}</Code>);
		else if (bold) nodes.push(<strong key={`${start}`}>{bold}</strong>);
		else if (lang && spanText)
			nodes.push(
				<span key={`${start}`} lang={lang}>
					{renderMarkdownInline(spanText)}
				</span>,
			);
		else if (autolink)
			nodes.push(
				<a key={`${start}`} href={autolink}>
					{autolink}
				</a>,
			);

		cursor = start + raw.length;
	}

	if (cursor < text.length) nodes.push(text.slice(cursor));
	return nodes;
}

type HeadingTag = "h3" | "h4" | "h5" | "h6";

// Méthodologies are numbered steps whose sub-points are indented bullets: one nesting level, no deeper.
export function renderMarkdown(
	source: string,
	namedBlocks: Record<string, ReactNode> = {},
): ReactNode[] {
	const blocks: ReactNode[] = [];
	let paragraph: string[] = [];
	let list: List | undefined;

	const flush = () => {
		if (paragraph.length)
			blocks.push(
				<p key={`p${blocks.length}`}>
					{renderMarkdownInline(paragraph.reduce(joinLines))}
				</p>,
			);
		if (list) {
			const ListTag = list.ordered ? "ol" : "ul";
			blocks.push(
				<ListTag key={`${ListTag}${blocks.length}`}>
					{list.items.map((item, index) => (
						<li key={index}>
							{renderMarkdownInline(item.text)}
							{item.children.length > 0 && (
								<ul>
									{item.children.map((child, childIndex) => (
										<li key={childIndex}>{renderMarkdownInline(child)}</li>
									))}
								</ul>
							)}
						</li>
					))}
				</ListTag>,
			);
		}
		paragraph = [];
		list = undefined;
	};

	const pushItem = (ordered: boolean, text: string) => {
		if (paragraph.length || (list && list.ordered !== ordered)) flush();
		list ??= { ordered, items: [] };
		list.items.push({ text, children: [] });
	};

	for (const raw of source.split("\n")) {
		const line = raw.trim();
		const text = HARD_BREAK.test(raw)
			? `${line.replace(/\\$/, "").trimEnd()}\n`
			: line;
		const indented = raw.length > line.length && /^\s/.test(raw);
		const lastItem = list?.items.at(-1);

		if (!line) {
			flush();
			continue;
		}
		if (indented && lastItem && LIST_ITEM.test(line)) {
			lastItem.children.push(text.replace(LIST_ITEM, ""));
			continue;
		}
		if (indented && lastItem) {
			const { children } = lastItem;
			const last = children.length - 1;
			if (last >= 0) children[last] = joinLines(children[last] ?? "", text);
			else lastItem.text = joinLines(lastItem.text, text);
			continue;
		}
		const placeholder = BLOCK_PLACEHOLDER.exec(line);
		if (placeholder) {
			const [, name = ""] = placeholder;
			if (!(name in namedBlocks))
				throw new Error(
					`Bloc inconnu {{${name}}} : blocs disponibles ${Object.keys(namedBlocks).join(", ") || "aucun"}`,
				);
			flush();
			blocks.push(
				<Fragment key={`b${blocks.length}`}>{namedBlocks[name]}</Fragment>,
			);
			continue;
		}
		const classed = CLASSED_PARAGRAPH.exec(line);
		if (classed) {
			flush();
			const [, className, text = ""] = classed;
			blocks.push(
				<p key={`p${blocks.length}`} className={className}>
					{renderMarkdownInline(text)}
				</p>,
			);
			continue;
		}
		const heading = HEADING.exec(line);
		if (heading) {
			flush();
			const [, hashes = "###", text = ""] = heading;
			const Tag = `h${hashes.length}` as HeadingTag;
			blocks.push(
				<Tag key={`h${blocks.length}`} id={slugify(text)}>
					{renderMarkdownInline(text)}
				</Tag>,
			);
			continue;
		}
		if (ORDERED_ITEM.test(line)) {
			pushItem(true, text.replace(ORDERED_ITEM, ""));
			continue;
		}
		if (LIST_ITEM.test(line)) {
			pushItem(false, text.replace(LIST_ITEM, ""));
			continue;
		}
		if (list) flush();
		paragraph.push(text);
	}

	flush();
	return blocks;
}

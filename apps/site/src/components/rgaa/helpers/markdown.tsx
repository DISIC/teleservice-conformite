"use client";

import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

// Every published string (titles, conditions, méthodologies, annexes) is markdown: links, inline code, bold, lists.
const INLINE = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
const LIST_ITEM = /^[-*]\s+/;
const ORDERED_ITEM = /^\d+\.\s+/;

type ListItem = { text: string; children: string[] };
type List = { ordered: boolean; items: ListItem[] };

// Attributes and accessible names take text, never elements.
export function toPlainText(source: string): string {
	return source.replace(INLINE, (_, linkText, __, code, bold) =>
		[linkText, code, bold].find((value) => value !== undefined),
	);
}

export function renderMarkdownInline(text: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let cursor = 0;

	for (const match of text.matchAll(INLINE)) {
		const [raw, linkText, href, code, bold] = match;
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

		cursor = start + raw.length;
	}

	if (cursor < text.length) nodes.push(text.slice(cursor));
	return nodes;
}

// Méthodologies are numbered steps whose sub-points are indented bullets: one nesting level, no deeper.
export function renderMarkdown(source: string): ReactNode[] {
	const blocks: ReactNode[] = [];
	let paragraph: string[] = [];
	let list: List | undefined;

	const flush = () => {
		if (paragraph.length)
			blocks.push(
				<p key={`p${blocks.length}`}>
					{renderMarkdownInline(paragraph.join(" "))}
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
		const indented = raw.length > line.length && /^\s/.test(raw);
		const lastItem = list?.items.at(-1);

		if (!line) {
			flush();
			continue;
		}
		if (indented && lastItem && LIST_ITEM.test(line)) {
			lastItem.children.push(line.replace(LIST_ITEM, ""));
			continue;
		}
		if (indented && lastItem) {
			const { children } = lastItem;
			if (children.length) children[children.length - 1] += ` ${line}`;
			else lastItem.text += ` ${line}`;
			continue;
		}
		if (ORDERED_ITEM.test(line)) {
			pushItem(true, line.replace(ORDERED_ITEM, ""));
			continue;
		}
		if (LIST_ITEM.test(line)) {
			pushItem(false, line.replace(LIST_ITEM, ""));
			continue;
		}
		if (list) flush();
		paragraph.push(line);
	}

	flush();
	return blocks;
}

function Code({ children }: { children: string }) {
	const { classes } = useStyles();

	return <code className={classes.code}>{children}</code>;
}

const useStyles = tss.withName("Markdown").create({
	code: {
		border: `1px solid ${fr.colors.decisions.border.default.beigeGrisGalet.default}`,
		padding: fr.spacing("1v"),
	},
});

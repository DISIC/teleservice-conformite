"use client";

import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

// Every published string (titles, conditions, méthodologies, annexes) is markdown: links, inline code, bold, lists.
const INLINE = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
const LIST_ITEM = /^[-*]\s+/;

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

export function renderMarkdown(source: string): ReactNode[] {
	const blocks: ReactNode[] = [];
	const lines = source.split("\n").map((line) => line.trim());
	let paragraph: string[] = [];
	let items: string[] = [];

	const flush = () => {
		if (paragraph.length)
			blocks.push(
				<p key={`p${blocks.length}`}>
					{renderMarkdownInline(paragraph.join(" "))}
				</p>,
			);
		if (items.length)
			blocks.push(
				<ul key={`ul${blocks.length}`}>
					{items.map((item, index) => (
						<li key={index}>{renderMarkdownInline(item)}</li>
					))}
				</ul>,
			);
		paragraph = [];
		items = [];
	};

	for (const line of lines) {
		if (!line) {
			flush();
			continue;
		}
		if (LIST_ITEM.test(line)) {
			if (paragraph.length) flush();
			items.push(line.replace(LIST_ITEM, ""));
			continue;
		}
		if (items.length) flush();
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

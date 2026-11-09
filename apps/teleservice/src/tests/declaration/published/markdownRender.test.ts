import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { describe, expect, it } from "vitest";
import {
	rehypePlugins,
	remarkPlugins,
} from "~/components/declaration/markdownPlugins";

const render = (content: string) =>
	renderToStaticMarkup(
		createElement(Markdown, { remarkPlugins, rehypePlugins }, content),
	);

const generated = (name: string) =>
	readFileSync(
		new URL(`./__snapshots__/markdown/${name}.md`, import.meta.url),
		"utf8",
	);

describe("published markdown rendering", () => {
	it("keeps the HTML the generator emits", () => {
		const html = render(generated("obsolete"));

		expect(html).toContain('<div class="declaration-obsolete">');
		expect(html).toContain(
			'<p class="fr-badge fr-badge--error fr-badge--sm fr-badge--no-icon">',
		);
		expect(html).toContain('<p class="fr-h6">');
		expect(html).toContain("<br/>");
	});

	it.each(["full-republished", "no-audit", "obsolete"])(
		"renders the %s declaration exactly as unsanitized raw HTML would",
		(name) => {
			const unsanitized = renderToStaticMarkup(
				createElement(
					Markdown,
					{ remarkPlugins, rehypePlugins: [rehypeRaw] },
					generated(name),
				),
			);

			expect(render(generated(name))).toBe(unsanitized);
		},
	);

	it("strips HTML typed into a declaration field", () => {
		const html = render(
			[
				"# Déclaration d’accessibilité de <img src=x onerror=alert(1)>",
				"",
				'<script>alert(1)</script><iframe src="https://evil.example"></iframe>',
				"",
				'<a href="javascript:alert(1)" onclick="alert(1)">lien</a>',
				"",
				'<p class="fr-badge" style="position:fixed" onmouseover="alert(1)">x</p>',
			].join("\n"),
		);

		expect(html).not.toMatch(/<script|<iframe|onerror|onclick|onmouseover/);
		expect(html).not.toContain("javascript:");
		expect(html).not.toContain("style=");
		expect(html).toContain('<p class="fr-badge">x</p>');
	});
});

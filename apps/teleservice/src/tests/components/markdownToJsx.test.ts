import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Markdown from "react-markdown";
import { REHYPE_PLUGINS } from "~/components/declaration/MarkdownToJsx";

const render = (content: string) =>
	renderToStaticMarkup(
		createElement(Markdown, { rehypePlugins: REHYPE_PLUGINS }, content),
	);

describe("published markdown HTML", () => {
	it("strips scripts and event handlers from declarants' texts", () => {
		const html = render(
			'<img src="x" onerror="alert(1)"><script>alert(2)</script>\n\n[lien](javascript:alert(3))',
		);
		expect(html).not.toContain("onerror");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("javascript:");
	});

	it("keeps the markup the templates emit", () => {
		const html = render(
			'<div class="declaration-obsolete"><p class="fr-badge fr-badge--error">Obsolète</p></div>\n\n- **Courrier**<br/><small>Gratuit</small>',
		);
		expect(html).toContain('<div class="declaration-obsolete">');
		expect(html).toContain('<p class="fr-badge fr-badge--error">');
		expect(html).toContain("<br/>");
		expect(html).toContain("<small>Gratuit</small>");
	});
});

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PublishedTemplate from "~/components/declaration/PublishedTemplate";
import { extractDeclarationContentToPublish } from "~/utils/declaration-content";
import { completeDeclaration } from "./declaration.fixture";

const render = (app_kind: "website" | "mobile_app" | "other") =>
	renderToStaticMarkup(
		createElement(
			CacheProvider,
			{ value: createCache({ key: "css" }) },
			createElement(PublishedTemplate, {
				declaration: extractDeclarationContentToPublish(
					completeDeclaration({ app_kind, url: "https://exemple.gouv.fr" }),
				),
			}),
		),
	);

describe("PublishedTemplate", () => {
	it("names the service type in the scope sentence", () => {
		expect(render("website")).toContain(
			's’applique au Site web <a href="https://exemple.gouv.fr"',
		);
	});

	it("omits the catch-all « Autre » from the scope sentence", () => {
		const html = render("other");
		expect(html).toContain('s’applique à <a href="https://exemple.gouv.fr"');
		expect(html).not.toContain("Autre");
	});
});

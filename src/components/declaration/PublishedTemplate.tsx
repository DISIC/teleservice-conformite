import MarkdownToJsx from "~/components/declaration/MarkdownToJsx";
import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { buildPublishedMarkdown } from "~/domain/declaration/published/markdown";

export { extractDeclarationContentToPublish } from "~/domain/declaration/published/snapshot";

export type PublishedTemplateMode = "preview" | "published";

type PublishedTemplateProps = {
	declaration: PublishedDeclaration;
	mode?: PublishedTemplateMode;
};

export default function PublishedTemplate({
	declaration,
	mode = "published",
}: PublishedTemplateProps) {
	return (
		<MarkdownToJsx
			content={buildPublishedMarkdown(declaration, { today: new Date() })}
			mode={mode}
		/>
	);
}

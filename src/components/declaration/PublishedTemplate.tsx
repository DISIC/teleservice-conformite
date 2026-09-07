import MarkdownToJsx from "~/components/declaration/MarkdownToJsx";
import type { PublishedDeclaration } from "~/utils/declaration-content";
import { buildPublishedMarkdown } from "~/utils/declaration/publishedMarkdown";

export { extractDeclarationContentToPublish } from "~/utils/declaration-content";

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

import MarkdownToJsx from "~/components/declaration/MarkdownToJsx";
import type { DepositedDeclaration } from "~/domain/declaration/deposited/snapshot";
import { buildDepositedMarkdown } from "~/domain/declaration/deposited/markdown";

export { extractDeclarationContentToDeposit } from "~/domain/declaration/deposited/snapshot";

export type DepositedTemplateMode = "preview" | "deposited";

type DepositedTemplateProps = {
	declaration: DepositedDeclaration;
	mode?: DepositedTemplateMode;
	today?: Date;
};

export default function DepositedTemplate({
	declaration,
	mode = "deposited",
	today = new Date(),
}: DepositedTemplateProps) {
	return (
		<MarkdownToJsx
			content={buildDepositedMarkdown(declaration, { today })}
			mode={mode}
		/>
	);
}

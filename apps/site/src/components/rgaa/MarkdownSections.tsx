import { fr } from "@codegouvfr/react-dsfr";
import type { MarkdownSection } from "~/lib/content";
import { renderMarkdown } from "./helpers/markdown";
import PublishDeclarationCallOut from "./PublishDeclarationCallOut";

const MARKDOWN_BLOCKS = {
	"publier-declaration": <PublishDeclarationCallOut />,
};

interface MarkdownSectionsProps {
	sections: MarkdownSection[];
}

export default function MarkdownSections({ sections }: MarkdownSectionsProps) {
	return (
		<>
			{sections.map(({ id, label, body }) => (
				<section key={id}>
					<h2 id={id} className={fr.cx("fr-mb-5w")}>
						{label}
					</h2>
					{renderMarkdown(body, MARKDOWN_BLOCKS)}
					<div
						style={{
							display: "flex",
							justifyContent: "flex-end",
							marginBlock: fr.spacing("9w"),
						}}
					>
						<a
							href="#contenu"
							className={fr.cx(
								"fr-link",
								"fr-icon-arrow-up-fill",
								"fr-link--icon-left",
							)}
						>
							Haut de page
						</a>
					</div>
				</section>
			))}
		</>
	);
}

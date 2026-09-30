import { fr } from "@codegouvfr/react-dsfr";
import type { MarkdownSection } from "~/lib/content";
import { renderMarkdown } from "./helpers/markdown";

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
					{renderMarkdown(body)}
					<div
						className={fr.cx("fr-mb-4w")}
						style={{ display: "flex", justifyContent: "flex-end" }}
					>
						<a
							href="#contenu"
							className={fr.cx(
								"fr-link",
								"fr-link--lg",
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

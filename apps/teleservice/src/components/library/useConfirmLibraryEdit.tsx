import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import type { ConfirmationModalActions } from "~/components/modal/ConfirmationModal";
import { api } from "~/lib/api";
import { newTabLinkProps } from "~/lib/newTabLink";

type LibraryKind = "contact" | "schema";

const NOUNS: Record<LibraryKind, string> = {
	contact: "contact",
	schema: "schéma",
};

type Params = {
	kind: LibraryKind;
	confirmationModalActions: ConfirmationModalActions;
	onError: (message: string) => void;
};

/** Editing an item used by a published declaration updates that declaration, so the user confirms first. */
export function useConfirmLibraryEdit({
	kind,
	confirmationModalActions,
	onError,
}: Params) {
	const { classes } = useStyles();
	const utils = api.useUtils();
	const noun = NOUNS[kind];

	return async (id: number, openEditor: () => void) => {
		let linked: { id: number; name: string; isPublished: boolean }[];
		try {
			linked = await utils.library.linkedDeclarations.fetch({ kind, id });
		} catch (e) {
			onError(e instanceof Error ? e.message : String(e));
			return;
		}

		if (!linked.some((declaration) => declaration.isPublished)) {
			openEditor();
			return;
		}

		confirmationModalActions.open?.({
			title: `Attention, ce ${noun} est associé à des déclarations publiées.`,
			confirmLabel: `Modifier le ${noun}`,
			confirmIconId: "fr-icon-edit-line",
			description: (
				<>
					<p>
						{linked.length === 1 ? (
							<>
								Les modifications seront appliquées à 1 déclaration
								d’accessibilité associée à ce {noun}.
								<br />
								Elle sera automatiquement mise à jour.
							</>
						) : (
							<>
								Les modifications seront appliquées à {linked.length}{" "}
								déclarations d’accessibilité associées à ce {noun}.
								<br />
								Elles seront automatiquement mises à jour.
							</>
						)}
					</p>
					<ul>
						{linked.map((declaration) => (
							<li key={declaration.id}>
								<a
									href={`/dashboard/declarations/${declaration.id}`}
									{...newTabLinkProps(declaration.name)}
									className={classes.link}
								>
									{declaration.name}
								</a>
							</li>
						))}
					</ul>
				</>
			),
			onConfirm: openEditor,
		});
	};
}

const useStyles = tss.withName("useConfirmLibraryEdit").create({
	link: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
	},
});

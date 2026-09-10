import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import { tss } from "tss-react";
import { PathPicker } from "~/components/declaration/creation/PathPicker";
import { useModalReturnFocus } from "~/hooks/useModalReturnFocus";
import type { Entity } from "~/payload/payload-types";

export type CreateDeclarationModalActions = {
	open?: () => void;
};

export function CreateDeclarationModal({
	actions,
	entity,
}: {
	actions: CreateDeclarationModalActions;
	entity: Entity | null;
}) {
	const { classes, cx } = useStyles();
	const id = useId();
	const { push } = useRouter();

	const [modal] = useState(() =>
		createModal({
			id: `createDeclarationModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	actions.open = useModalReturnFocus(modal);

	return (
		<modal.Component size="large" title="Créer une déclaration">
			<p className={cx(classes.description, fr.cx("fr-text--sm"))}>
				Tous les champs sont obligatoires sauf précision contraire
			</p>
			<PathPicker
				entity={entity}
				onCreated={(declarationId) =>
					push(`/dashboard/declarations/${declarationId}`)
				}
			/>
		</modal.Component>
	);
}

const useStyles = tss.withName(CreateDeclarationModal.name).create({
	description: {
		color: fr.colors.decisions.text.mention.grey.default,
		margin: 0,
		marginBottom: fr.spacing("6v"),
	},
});

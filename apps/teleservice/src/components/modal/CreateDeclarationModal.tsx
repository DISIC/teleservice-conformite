import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import { PathPicker } from "~/components/declaration/creation/PathPicker";
import { RequiredFieldsNotice } from "~/components/form/RequiredField";
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
			<RequiredFieldsNotice />
			<PathPicker
				entity={entity}
				onCreated={(declarationId) =>
					push(`/dashboard/declarations/${declarationId}`)
				}
			/>
		</modal.Component>
	);
}

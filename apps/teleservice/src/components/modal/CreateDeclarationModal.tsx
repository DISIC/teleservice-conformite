import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useRouter } from "next/router";
import { useId, useState } from "react";
import { PathPicker } from "~/components/declaration/creation/PathPicker";
import { RequiredFieldsNotice } from "~/components/form/RequiredField";
import { useAccessibleModal } from "~/hooks/useAccessibleModal";

export type CreateDeclarationModalActions = {
	open?: () => void;
};

export function CreateDeclarationModal({
	actions,
}: {
	actions: CreateDeclarationModalActions;
}) {
	const id = useId();
	const { push } = useRouter();

	const [modal] = useState(() =>
		createModal({
			id: `createDeclarationModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	actions.open = useAccessibleModal(modal);

	return (
		<modal.Component size="large" title="Créer une déclaration">
			<RequiredFieldsNotice />
			<PathPicker
				onCreated={(declarationId) =>
					push(`/dashboard/declarations/${declarationId}`)
				}
			/>
		</modal.Component>
	);
}

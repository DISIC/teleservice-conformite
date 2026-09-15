import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useEffect, useId, useMemo, useState } from "react";
import type { Schema } from "~/payload/payload-types";
import { useModalReturnFocus } from "~/hooks/useModalReturnFocus";
import { api } from "~/lib/api";
import { useAppForm } from "~/forms/context";
import { SchemaForm as EntitySchemaForm } from "~/forms/schema/schemaForm";
import { schemaFormOptions, type ZSchema } from "~/forms/schema/schemaSchema";

export type LibrarySchemaModalActions = {
	open?: (schema?: Schema | null) => void;
};

interface LibrarySchemaModalProps {
	actions: LibrarySchemaModalActions;
}

export function LibrarySchemaModal({ actions }: LibrarySchemaModalProps) {
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `librarySchemaModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const openModal = useModalReturnFocus(modal);

	const [editing, setEditing] = useState<Schema | null>(null);

	const apiUtils = api.useUtils();

	const { mutateAsync: upsertSchema } = api.library.upsertSchema.useMutation({
		onSuccess: () => apiUtils.library.listSchemas.invalidate(),
	});

	const defaultValues = useMemo<ZSchema>(
		() =>
			editing
				? {
						name: editing.name,
						url: editing.url ?? "",
						actionPlanUrls: (editing.actionPlanUrls ?? []).map((i) => ({
							name: i.name,
							url: i.url,
						})),
					}
				: schemaFormOptions.defaultValues,
		[editing],
	);

	const form = useAppForm({
		...schemaFormOptions,
		defaultValues,
		onSubmit: async ({ value }: { value: ZSchema }) => {
			await upsertSchema({
				values: value,
				id: editing?.id,
			});
			modal.close();
			setEditing(null);
		},
	});

	actions.open = (schema) => {
		setEditing(schema ?? null);
		openModal();
	};

	useEffect(() => {
		form.reset();
	}, [defaultValues]);

	useIsModalOpen(modal, {
		onConceal: () => {
			setEditing(null);
			form.reset();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			onInvalid={() => form.validate("submit")}
		>
			<modal.Component
				buttons={[
					{ children: "Annuler", type: "button" },
					{
						children: "Enregistrer",
						type: "submit",
						doClosesModal: false,
					},
				]}
				size="large"
				title={editing ? "Modifier un schéma" : "Ajouter un schéma"}
			>
				<EntitySchemaForm form={form} readOnly={false} />
			</modal.Component>
		</form>
	);
}

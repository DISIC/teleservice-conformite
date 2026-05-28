import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useEffect, useId, useMemo, useState } from "react";
import { tss } from "tss-react";
import type { Schema } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as EntitySchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions, type ZSchema } from "~/utils/form/schema/schema";

export type LibrarySchemaModalActions = {
	open?: (schema?: Schema | null) => void;
};

interface LibrarySchemaModalProps {
	entityId: number;
	actions: LibrarySchemaModalActions;
}

export function LibrarySchemaModal({
	entityId,
	actions,
}: LibrarySchemaModalProps) {
	const { classes } = useStyles();
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `librarySchemaModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const [editing, setEditing] = useState<Schema | null>(null);

	const apiUtils = api.useUtils();

	const { mutateAsync: upsertSchema } =
		api.entityLibrary.upsertSchema.useMutation({
			onSuccess: () => apiUtils.entityLibrary.listSchemas.invalidate(),
		});

	const defaultValues = useMemo<ZSchema>(
		() =>
			editing
				? {
						schemaName: editing.schemaName,
						schemaUrl: editing.schemaUrl ?? "",
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
				entityId,
			});
			modal.close();
			setEditing(null);
		},
	});

	actions.open = (schema) => {
		setEditing(schema ?? null);
		modal.open();
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
				title={
					<section className={classes.modalHeader}>
						<h1 className={classes.modalHeading}>
							{editing ? "Modifier un schéma" : "Ajouter un schéma"}
						</h1>
					</section>
				}
			>
				<EntitySchemaForm form={form} readOnly={false} />
			</modal.Component>
		</form>
	);
}

const useStyles = tss.withName("LibrarySchemaModal").create({
	modalHeader: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	modalHeading: {
		color: fr.colors.decisions.text.title.grey.default,
		fontFamily: "Marianne",
		fontSize: "1.5rem",
		fontStyle: "normal",
		fontWeight: 700,
		lineHeight: "2rem",
		marginBottom: 0,
	},
});

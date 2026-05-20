import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useEffect, useId, useMemo, useState } from "react";
import { tss } from "tss-react";
import type { Contact } from "~/payload/payload-types";
import { api } from "~/utils/api";
import { ContactTypeForm } from "~/utils/form/contact/form";
import {
	contactFormOptions,
	type ZContactForm,
} from "~/utils/form/contact/schema";
import { useAppForm } from "~/utils/form/context";

export type LibraryContactModalActions = {
	open?: (contact?: Contact | null) => void;
};

interface LibraryContactModalProps {
	entityId: number;
	actions: LibraryContactModalActions;
}

export function LibraryContactModal({
	entityId,
	actions,
}: LibraryContactModalProps) {
	const { classes } = useStyles();
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `libraryContactModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const [editing, setEditing] = useState<Contact | null>(null);

	const apiUtils = api.useUtils();

	const { mutateAsync: upsertContact } =
		api.entityLibrary.upsertContact.useMutation({
			onSuccess: () => apiUtils.entityLibrary.listContacts.invalidate(),
		});

	const defaultValues = useMemo<ZContactForm>(
		() =>
			editing
				? {
						name: editing.name,
						email: editing.email ?? "",
						url: editing.url ?? "",
					}
				: contactFormOptions.defaultValues,
		[editing],
	);

	const form = useAppForm({
		...contactFormOptions,
		defaultValues,
		onSubmit: async ({ value }: { value: ZContactForm }) => {
			await upsertContact({
				values: value,
				id: editing?.id,
				entityId,
			});
			modal.close();
			setEditing(null);
		},
	});

	useEffect(() => {
		actions.open = (contact) => {
			setEditing(contact ?? null);
			form.reset();
			modal.open();
		};
	}, []);

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
							{editing ? "Modifier un contact" : "Ajouter un contact"}
						</h1>
					</section>
				}
			>
				<ContactTypeForm form={form} readOnly={false} />
			</modal.Component>
		</form>
	);
}

const useStyles = tss.withName("LibraryContactModal").create({
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

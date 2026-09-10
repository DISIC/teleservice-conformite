import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useEffect, useId, useMemo, useState } from "react";
import type { Contact } from "~/payload/payload-types";
import { useModalReturnFocus } from "~/hooks/useModalReturnFocus";
import { api } from "~/lib/api";
import { ContactTypeForm } from "~/forms/contact/contactForm";
import {
	contactFormOptions,
	type ZContactForm,
} from "~/forms/contact/contactSchema";
import { useAppForm } from "~/forms/context";

export type LibraryContactModalActions = {
	open?: (contact?: Contact | null) => void;
};

interface LibraryContactModalProps {
	actions: LibraryContactModalActions;
}

export function LibraryContactModal({ actions }: LibraryContactModalProps) {
	const id = useId();

	const [modal] = useState(() =>
		createModal({
			id: `libraryContactModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const openModal = useModalReturnFocus(modal);

	const [editing, setEditing] = useState<Contact | null>(null);

	const apiUtils = api.useUtils();

	const { mutateAsync: upsertContact } = api.library.upsertContact.useMutation({
		onSuccess: () => apiUtils.library.listContacts.invalidate(),
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
			});
			modal.close();
			setEditing(null);
		},
	});

	actions.open = (contact) => {
		setEditing(contact ?? null);
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
				title={editing ? "Modifier un contact" : "Ajouter un contact"}
			>
				<ContactTypeForm form={form} readOnly={false} />
			</modal.Component>
		</form>
	);
}

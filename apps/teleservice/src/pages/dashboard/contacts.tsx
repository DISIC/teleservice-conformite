import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import type { TagProps } from "@codegouvfr/react-dsfr/Tag";
import TagsGroup from "@codegouvfr/react-dsfr/TagsGroup";
import NationalIdentityCard from "@codegouvfr/react-dsfr/picto/NationalIdentityCard";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tss } from "tss-react";
import { PageHeading } from "~/components/layout/PageHeading";
import { ItemActions } from "~/components/library/ItemActions";
import {
	ConfirmationModal,
	type ConfirmationModalActions,
} from "~/components/modal/ConfirmationModal";
import {
	LibraryContactModal,
	type LibraryContactModalActions,
} from "~/components/modal/LibraryContactModal";
import EmptyState from "~/components/ui/EmptyState";
import { EmptyValue } from "~/components/ui/EmptyValue";
import { Loader } from "~/components/ui/Loader";
import Table from "~/components/ui/Table";
import type { Contact, Entity } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { loadEntityForPage } from "~/lib/server-guards";

const columnHelper = createColumnHelper<Contact>();

const ADD_CONTACT_BUTTON_ID = "add-contact-button";
const deleteButtonId = (contact: Contact) => `delete-contact-${contact.id}`;

export default function ContactsPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const utils = api.useUtils();

	const [contactModalActions] = useState<LibraryContactModalActions>({});
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const focusAfterDeleteRef = useRef<string | null>(null);

	const {
		data: contacts = [],
		isLoading,
		isFetching,
	} = api.library.listContacts.useQuery();

	const { mutate: deleteContact } = api.library.deleteContact.useMutation({
		onSuccess: () => utils.library.listContacts.invalidate(),
		onError: (e) => {
			focusAfterDeleteRef.current = null;
			setErrorMessage(e.message);
		},
	});

	// The deleted row's button is gone once the list reloads, so focus moves to a neighbour.
	useEffect(() => {
		const targetId = focusAfterDeleteRef.current;
		if (isFetching || !targetId) return;
		focusAfterDeleteRef.current = null;
		(
			document.getElementById(targetId) ??
			document.getElementById(ADD_CONTACT_BUTTON_ID)
		)?.focus();
	}, [isFetching]);

	const confirmDelete = useCallback(
		(contact: Contact) =>
			confirmationModalActions.open?.({
				title: "Supprimer le contact",
				confirmLabel: "Supprimer",
				confirmIconId: "fr-icon-delete-fill",
				description: (
					<>
						<p>
							Êtes-vous sûr de vouloir supprimer le contact{" "}
							<strong>{contact.name}</strong> ? Cette action est irréversible.
						</p>
						<p>
							Les déclarations liées à ce contact conservent les informations
							déjà renseignées, mais ne seront plus mises à jour depuis votre
							bibliothèque.
						</p>
					</>
				),
				onConfirm: () => {
					const index = contacts.findIndex(({ id }) => id === contact.id);
					// The next row takes the focus, or the previous one when the last row is deleted.
					const neighbour = contacts[index + 1] ?? contacts[index - 1];
					focusAfterDeleteRef.current = neighbour
						? deleteButtonId(neighbour)
						: ADD_CONTACT_BUTTON_ID;
					deleteContact({ id: contact.id });
				},
			}),
		[confirmationModalActions, deleteContact, contacts],
	);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				id: "name",
				header: "Nom du contact",
				cell: (info) => <strong>{info.getValue()}</strong>,
			}),
			columnHelper.display({
				id: "kinds",
				header: "Moyens de contact",
				cell: (info) => {
					const { email, url } = info.row.original;
					const tags: TagProps[] = [
						...(email ? [{ children: "Email" }] : []),
						...(url ? [{ children: "Formulaire" }] : []),
					];
					const [first, ...rest] = tags;
					return first ? (
						<TagsGroup
							smallTags
							tags={[first, ...rest]}
							className={classes.tags}
						/>
					) : (
						<EmptyValue />
					);
				},
			}),
			columnHelper.display({
				id: "url",
				header: "Lien URL du formulaire",
				cell: (info) => {
					const url = info.row.original.url;
					return url ? (
						<span className={classes.hint}>{url}</span>
					) : (
						<EmptyValue />
					);
				},
			}),
			columnHelper.display({
				id: "email",
				header: "Email de contact",
				cell: (info) => {
					const email = info.row.original.email;
					return email ? (
						<span className={classes.hint}>{email}</span>
					) : (
						<EmptyValue />
					);
				},
			}),
			columnHelper.display({
				id: "actions",
				header: () => <span className={fr.cx("fr-sr-only")}>Actions</span>,
				meta: { styles: { justifyContent: "flex-end" } },
				cell: (info) => {
					const contact = info.row.original;
					return (
						<ItemActions
							label={contact.name}
							onEdit={() => contactModalActions.open?.(contact)}
							onDelete={() => confirmDelete(contact)}
							deleteButtonId={deleteButtonId(contact)}
						/>
					);
				},
			}),
		],
		[classes.hint, classes.tags, confirmDelete, contactModalActions],
	);

	const openCreate = () => contactModalActions.open?.();

	return (
		<>
			<Head>
				<title>
					Mes contacts - Téléservice de déclaration d’accessibilité numérique
				</title>
			</Head>
			<PageHeading
				title="Mes contacts"
				pictogram={<NationalIdentityCard fontSize="3.5rem" />}
				entityName={entity.name}
				actions={
					<Button
						iconId="fr-icon-add-line"
						onClick={openCreate}
						nativeButtonProps={{ id: ADD_CONTACT_BUTTON_ID }}
					>
						Ajouter un contact
					</Button>
				}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{errorMessage && (
						<Alert
							small
							severity="error"
							description={errorMessage}
							closable
							onClose={() => setErrorMessage(null)}
						/>
					)}
					{isLoading || isFetching ? (
						<Loader />
					) : contacts.length === 0 ? (
						<EmptyState
							pictogram={<NationalIdentityCard fontSize="3rem" />}
							title="Vous n’avez aucun contact enregistré"
							description="Centralisez et gérez les contacts nécessaires à vos déclarations d’accessibilité."
							ctaProps={{
								children: "Ajouter un contact",
								onClick: openCreate,
								iconId: "fr-icon-add-line",
							}}
						/>
					) : (
						<Table
							caption="Liste de mes contacts"
							columns={columns}
							data={contacts}
							numberPerPage={10}
						/>
					)}
				</div>
			</div>
			<ConfirmationModal actions={confirmationModalActions} />
			<LibraryContactModal actions={contactModalActions} />
		</>
	);
}

const useStyles = tss.withName(ContactsPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
	},
	tags: {
		margin: 0,
		gap: fr.spacing("1v"),
		"& > li": {
			lineHeight: "normal",
		},
		"& .fr-tag": {
			margin: 0,
		},
	},
	hint: {
		fontSize: "0.875rem",
		color: fr.colors.decisions.text.mention.grey.default,
	},
});

export const getServerSideProps = (async (context) => {
	const { session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };
	if (!entity)
		return {
			redirect: { destination: "/dashboard/declarations", permanent: false },
		};

	return { props: { entity } };
}) satisfies GetServerSideProps<{ entity: Entity }>;

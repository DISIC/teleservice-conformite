import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import NationalIdentityCard from "@codegouvfr/react-dsfr/picto/NationalIdentityCard";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { tss } from "tss-react";
import { EditActionProvider, Part } from "~/components/form/Part";
import { ReadOnlyField } from "~/components/form/fields/ReadOnlyField";
import { PageHeading } from "~/components/layout/PageHeading";
import { ItemActions } from "~/components/library/ItemActions";
import { LinkedDeclarationsTag } from "~/components/library/LinkedDeclarationsTag";
import {
	ConfirmationModal,
	type ConfirmationModalActions,
} from "~/components/modal/ConfirmationModal";
import {
	LibraryContactModal,
	type LibraryContactModalActions,
} from "~/components/modal/LibraryContactModal";
import EmptyState, { type FaqItem } from "~/components/ui/EmptyState";
import { Loader } from "~/components/ui/Loader";
import { useFocusAfterDelete } from "~/hooks/useFocusAfterDelete";
import type { Contact, Entity } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { loadEntityForPage } from "~/lib/server-guards";
import { pageTitle } from "~/lib/serviceName";

export default function ContactsPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const utils = api.useUtils();

	const [contactModalActions] = useState<LibraryContactModalActions>({});
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const emptyStateFaq: FaqItem[] = [
		{
			question: "Qu’est-ce qu’un point de contact accessibilité ?",
			answer: (
				<p>
					Un point de contact accessibilité permet aux usagers de{" "}
					<span className={classes.bold}>
						signaler un défaut d’accessibilité.
					</span>{" "}
					Il sera affiché sur la déclaration d’accessibilité. Les voies de
					recours seront ajoutées automatiquement à la déclaration, vous n’avez
					rien à faire.
				</p>
			),
		},
	];

	const {
		data: contacts = [],
		isLoading,
		isFetching,
	} = api.library.listContacts.useQuery();
	const { addButtonId, deleteButtonId, deleteItem } = useFocusAfterDelete({
		itemName: "contact",
		isFetching,
		deleteMutation: api.library.deleteContact.useMutation({
			onSuccess: () => utils.library.listContacts.invalidate(),
			onError: (e) => setErrorMessage(e.message),
		}),
	});

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
				onConfirm: () => deleteItem(contact.id),
			}),
		[confirmationModalActions, deleteItem],
	);

	const openCreate = () => contactModalActions.open?.();

	return (
		<>
			<Head>
				<title>{pageTitle("Mes points de contacts accessibilité")}</title>
			</Head>
			<PageHeading
				title="Mes points de contacts accessibilité"
				pictogram={<NationalIdentityCard fontSize="3.5rem" />}
				entityName={entity.name}
				actions={
					<Button
						iconId="fr-icon-add-line"
						onClick={openCreate}
						nativeButtonProps={{ id: addButtonId }}
					>
						Ajouter un point de contact
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
							title="Vous n’avez aucun point de contact enregistré"
							description="Centralisez et gérez ici les points de contacts nécessaires à vos déclarations d’accessibilité."
							ctaProps={{
								children: "Ajouter un point de contact",
								onClick: openCreate,
								iconId: "fr-icon-add-line",
							}}
							faq={emptyStateFaq}
						/>
					) : (
						<>
							<h2 id="contacts-list-title" className={fr.cx("fr-sr-only")}>
								Liste de mes points de contact
							</h2>
							<ul
								className={classes.contactList}
								aria-labelledby="contacts-list-title"
							>
								{contacts.map((contact) => (
									<li key={contact.id}>
										<EditActionProvider
											value={
												<ItemActions
													label={contact.name}
													onEdit={() => contactModalActions.open?.(contact)}
													onDelete={() => confirmDelete(contact)}
													deleteButtonId={deleteButtonId(contact.id)}
													withLabels
												/>
											}
										>
											<Part
												readOnly
												definitionList
												grid={false}
												title={contact.name}
												titleAside={
													<LinkedDeclarationsTag
														count={contact.declarations?.totalDocs}
													/>
												}
											>
												<ReadOnlyField
													label="Email"
													value={contact.email ?? ""}
												/>
												<ReadOnlyField
													label="URL du formulaire de contact"
													value={contact.url ?? ""}
													link
												/>
											</Part>
										</EditActionProvider>
									</li>
								))}
							</ul>
						</>
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
	contactList: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
		"& > li": {
			margin: 0,
			padding: 0,
		},
		"& > li > div, & dl": {
			gap: fr.spacing("8v"),
		},
	},
	bold: {
		fontWeight: 700,
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

import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import NationalIdentityCard from "@codegouvfr/react-dsfr/picto/NationalIdentityCard";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { tss } from "tss-react";
import { EditActionProvider, Part } from "~/components/form/Part";
import { ReadOnlyField } from "~/components/form/fields/ReadOnlyField";
import { PageHeading } from "~/components/layout/PageHeading";
import { ItemActions } from "~/components/library/ItemActions";
import { LibraryList } from "~/components/library/LibraryList";
import { LinkedDeclarationsTag } from "~/components/library/LinkedDeclarationsTag";
import {
	ConfirmationModal,
	type ConfirmationModalActions,
} from "~/components/modal/ConfirmationModal";
import {
	LibraryContactModal,
	type LibraryContactModalActions,
} from "~/components/modal/LibraryContactModal";
import EmptyState from "~/components/ui/EmptyState";
import { CONTACT_FAQ } from "~/components/ui/emptyStateFaq";
import { Loader } from "~/components/ui/Loader";
import { useFocusAfterDelete } from "~/hooks/useFocusAfterDelete";
import type { Contact, Entity } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { newTabLinkProps } from "~/lib/newTabLink";
import { loadEntityForPage } from "~/lib/server-guards";
import { pageTitle } from "~/lib/serviceName";

const SUCCESS_ALERT_DURATION_MS = 5000;

type AlertDetails = {
	description: string;
	severity: "success" | "error";
};

export default function ContactsPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const utils = api.useUtils();

	const [contactModalActions] = useState<LibraryContactModalActions>({});
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});
	const alertRef = useRef<HTMLDivElement>(null);
	const [alert, setAlert] = useState<AlertDetails | null>(null);

	useEffect(() => {
		if (!alert) return;
		alertRef.current?.focus();
		if (alert.severity !== "success") return;

		const timeout = setTimeout(() => setAlert(null), SUCCESS_ALERT_DURATION_MS);
		return () => clearTimeout(timeout);
	}, [alert]);

	const {
		data: contacts = [],
		isLoading,
		isFetching,
	} = api.library.listContacts.useQuery();
	const { addButtonId, deleteButtonId, deleteItem } = useFocusAfterDelete({
		itemName: "contact",
		isFetching,
		deleteMutation: api.library.deleteContact.useMutation({
			onSuccess: () => {
				setAlert({
					description: "Votre contact a été supprimé avec succès",
					severity: "success",
				});
				return utils.library.listContacts.invalidate();
			},
			onError: (e) => setAlert({ description: e.message, severity: "error" }),
		}),
	});

	const confirmDelete = useCallback(
		(contact: Contact) =>
			confirmationModalActions.open?.({
				title: "Supprimer le contact",
				confirmLabel: "Supprimer le contact",
				confirmIconId: "fr-icon-delete-fill",
				confirmBackgroundColor:
					fr.colors.decisions.background.actionHigh.error.default,
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

	const openEdit = async (contact: Contact) => {
		let linked: { id: number; name: string; isPublished: boolean }[];
		try {
			linked = await utils.library.linkedDeclarations.fetch({
				kind: "contact",
				id: contact.id,
			});
		} catch (e) {
			setAlert({
				description: e instanceof Error ? e.message : String(e),
				severity: "error",
			});
			return;
		}

		if (!linked.some((declaration) => declaration.isPublished)) {
			contactModalActions.open?.(contact);
			return;
		}

		confirmationModalActions.open?.({
			title: "Attention, ce contact est associé à des déclarations publiées.",
			confirmLabel: "Modifier le contact",
			confirmIconId: "fr-icon-edit-line",
			description: (
				<>
					<p>
						{linked.length === 1 ? (
							<>
								Les modifications seront appliquées à 1 déclaration
								d’accessibilité associée à ce contact.
								<br />
								Elle sera automatiquement mise à jour.
							</>
						) : (
							<>
								Les modifications seront appliquées à {linked.length}{" "}
								déclarations d’accessibilité associées à ce contact.
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
			onConfirm: () => contactModalActions.open?.(contact),
		});
	};

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
					{alert && (
						<div className={classes.alertWrapper} ref={alertRef} tabIndex={-1}>
							<Alert
								small
								severity={alert.severity}
								description={alert.description}
								closable
								onClose={() => setAlert(null)}
							/>
						</div>
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
							faq={CONTACT_FAQ}
						/>
					) : (
						<LibraryList
							id="contacts-list-title"
							title="Liste de mes points de contact"
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
						</LibraryList>
					)}
				</div>
			</div>
			<ConfirmationModal actions={confirmationModalActions} />
			<LibraryContactModal
				actions={contactModalActions}
				onCreated={(name) =>
					setAlert({
						description: `Le contact « ${name} » a été ajouté avec succès`,
						severity: "success",
					})
				}
			/>
		</>
	);
}

const useStyles = tss.withName(ContactsPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		"& div": {
			width: "100%",
		},
		marginBottom: fr.spacing("6v"),
		animation: "fadeIn 0.25s ease-in-out",
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
	link: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
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

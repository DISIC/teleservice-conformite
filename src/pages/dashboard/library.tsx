import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import { BackButton } from "~/components/ui/BackButton";
import EmptyState from "~/components/ui/EmptyState";
import {
	LibraryContactModal,
	type LibraryContactModalActions,
} from "~/components/modal/LibraryContactModal";
import {
	LibrarySchemaModal,
	type LibrarySchemaModalActions,
} from "~/components/modal/LibrarySchemaModal";
import { Loader } from "~/components/ui/Loader";
import Table from "~/components/ui/Table";
import type { Contact } from "~/payload/payload-types";
import { api } from "~/lib/api";
import { authPages } from "~/lib/auth";

const contactColumnHelper = createColumnHelper<Contact>();

const ItemActions = ({
	onEdit,
	onDelete,
	className,
}: {
	onEdit: () => void;
	onDelete: () => void;
	className?: string;
}) => (
	<div className={className}>
		<Button
			priority="tertiary"
			iconId="fr-icon-edit-line"
			title="Modifier"
			size="small"
			onClick={onEdit}
		/>
		<Button
			priority="tertiary"
			iconId="fr-icon-delete-line"
			title="Supprimer"
			size="small"
			onClick={onDelete}
		/>
	</div>
);

export default function LibraryPage() {
	const { classes, cx } = useStyles();

	const utils = api.useUtils();

	const [contactModalActions] = useState<LibraryContactModalActions>({});
	const [schemaModalActions] = useState<LibrarySchemaModalActions>({});

	const {
		data: contacts = [],
		isLoading: isLoadingContacts,
		isFetching: isFetchingContacts,
	} = api.library.listContacts.useQuery();
	const {
		data: schemas = [],
		isLoading: isLoadingSchemas,
		isFetching: isFetchingSchemas,
	} = api.library.listSchemas.useQuery();

	const refresh = () => {
		utils.library.listContacts.invalidate();
		utils.library.listSchemas.invalidate();
	};

	const { mutateAsync: deleteContact } = api.library.deleteContact.useMutation({
		onSuccess: refresh,
		onError: (e) => alert(e.message),
	});
	const { mutateAsync: deleteSchema } = api.library.deleteSchema.useMutation({
		onSuccess: refresh,
		onError: (e) => alert(e.message),
	});

	const contactColumns = useMemo(
		() => [
			contactColumnHelper.accessor("name", {
				id: "name",
				cell: (info) => <strong>{info.getValue()}</strong>,
			}),
			contactColumnHelper.display({
				id: "kinds",
				cell: (info) => {
					const contact = info.row.original;
					return (
						<div className={classes.tags}>
							{contact.email && <Tag small>Email</Tag>}
							{contact.url && <Tag small>Formulaire</Tag>}
						</div>
					);
				},
			}),
			contactColumnHelper.display({
				id: "url",
				cell: (info) => {
					const url = info.row.original.url;
					if (!url) return null;
					return <span className={classes.hint}>{url}</span>;
				},
			}),
			contactColumnHelper.display({
				id: "email",
				cell: (info) => {
					const email = info.row.original.email;
					if (!email) return null;
					return <span className={classes.hint}>{email}</span>;
				},
			}),
			contactColumnHelper.display({
				id: "actions",
				meta: { styles: { justifyContent: "flex-end" } },
				cell: (info) => {
					const contact = info.row.original;
					return (
						<ItemActions
							className={classes.itemActions}
							onEdit={() => contactModalActions.open?.(contact)}
							onDelete={() => deleteContact({ id: contact.id })}
						/>
					);
				},
			}),
		],
		[
			classes.hint,
			classes.itemActions,
			classes.tags,
			deleteContact,
			contactModalActions,
		],
	);

	return (
		<>
			<Head>
				<title>Ma bibliothèque - Téléservice Conformité</title>
			</Head>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					<BackButton>Retour sur la liste des déclarations</BackButton>
					<div className={classes.headerWrapper}>
						<h1>Schémas et Contacts</h1>
						<Badge noIcon small>
							réutilisable dans vos déclarations
						</Badge>
					</div>
					<section className={classes.section}>
						<div className={classes.subHeaderWrapper}>
							<h2 className={fr.cx("fr-mb-0", "fr-h4")}>
								Schémas & plans d'actions
							</h2>
							{schemas.length > 0 && (
								<Button
									priority="secondary"
									onClick={() => schemaModalActions.open?.()}
									iconId="fr-icon-add-line"
								>
									Ajouter un schéma pluriannuel
								</Button>
							)}
						</div>
						{isLoadingSchemas || isFetchingSchemas ? (
							<Loader />
						) : schemas.length === 0 ? (
							<EmptyState
								description="Ajoutez un schéma pluriannuel et les plans d’action associés"
								ctaProps={{
									children: "Ajouter un schéma pluriannuel",
									onClick: () => schemaModalActions.open?.(),
									iconId: "fr-icon-add-line",
								}}
							/>
						) : (
							<ul className={classes.schemaList}>
								{schemas.map((schema) => (
									<li key={schema.id} className={classes.schemaCard}>
										<div
											className={cx(classes.schemaRow, classes.schemaHeaderRow)}
										>
											<strong>{schema.name}</strong>
											<span className={classes.hint}>{schema.url}</span>
											<span className={classes.hint} suppressHydrationWarning>
												Dernière mise à jour{" "}
												<Tag
													small
													linkProps={{
														href: "#",
														style: { pointerEvents: "none" },
													}}
												>
													{new Date(schema.updatedAt).toLocaleDateString(
														"fr-FR",
													)}
												</Tag>
											</span>
											<ItemActions
												className={classes.itemActions}
												onEdit={() => schemaModalActions.open?.(schema)}
												onDelete={() => deleteSchema({ id: schema.id })}
											/>
										</div>
										{(schema.actionPlanUrls ?? []).map((plan) => (
											<div
												key={plan.id ?? plan.url}
												className={cx(classes.schemaRow, classes.schemaPlanRow)}
											>
												<span>{plan.name}</span>
												<span className={classes.hint}>{plan.url}</span>
											</div>
										))}
									</li>
								))}
							</ul>
						)}
					</section>
					<section className={classes.section}>
						<div className={classes.subHeaderWrapper}>
							<h2 className={fr.cx("fr-mb-0", "fr-h4")}>Moyens de contact</h2>
							{contacts.length > 0 && (
								<Button
									priority="secondary"
									onClick={() => contactModalActions.open?.()}
									iconId="fr-icon-add-line"
								>
									Ajouter un contact
								</Button>
							)}
						</div>
						{isLoadingContacts || isFetchingContacts ? (
							<Loader />
						) : contacts.length === 0 ? (
							<EmptyState
								description="Ajoutez un contact"
								ctaProps={{
									children: "Ajouter un contact",
									onClick: () => contactModalActions.open?.(),
									iconId: "fr-icon-add-line",
								}}
							/>
						) : (
							<Table
								columns={contactColumns}
								data={contacts}
								numberPerPage={10}
								hideHeaders
							/>
						)}
					</section>
					<LibrarySchemaModal actions={schemaModalActions} />
					<LibraryContactModal actions={contactModalActions} />
				</div>
			</div>
		</>
	);
}

const useStyles = tss.withName(LibraryPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("8v"),
	},
	headerWrapper: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
		flexWrap: "wrap",
	},
	subHeaderWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
	schemaList: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "grid",
		gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
		gap: fr.spacing("6v"),
		"& > li": {
			margin: 0,
			padding: 0,
		},
	},
	schemaCard: {
		gridColumn: "1 / -1",
		display: "grid",
		gridTemplateColumns: "subgrid",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		borderRadius: 4,
		overflow: "hidden",
	},
	schemaRow: {
		gridColumn: "1 / -1",
		display: "grid",
		gridTemplateColumns: "subgrid",
		alignItems: "center",
		gap: fr.spacing("4v"),
		padding: `${fr.spacing("3v")} ${fr.spacing("4v")}`,
	},
	schemaHeaderRow: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
	},
	schemaPlanRow: {
		backgroundColor: fr.colors.decisions.background.alt.grey.default,
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
	},
	itemActions: {
		display: "flex",
		gap: fr.spacing("4v"),
		justifySelf: "end",
	},
	tags: {
		display: "flex",
		gap: fr.spacing("1v"),
		flexWrap: "wrap",
	},
	hint: {
		fontSize: "0.875rem",
		color: fr.colors.decisions.text.mention.grey.default,
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("2v"),
	},
});

export const getServerSideProps = (async (context) => {
	const session = await authPages.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) {
		return { redirect: { destination: "/", permanent: false } };
	}

	// Library ownership is resolved from the session inside tRPC; no props to fetch.
	return { props: {} };
}) satisfies GetServerSideProps;

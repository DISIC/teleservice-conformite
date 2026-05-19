import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import config from "@payload-config";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { getPayload } from "payload";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import {
	LibraryContactModal,
	type LibraryContactModalActions,
} from "~/components/modal/LibraryContactModal";
import {
	LibrarySchemaModal,
	type LibrarySchemaModalActions,
} from "~/components/modal/LibrarySchemaModal";
import Table from "~/components/system/Table";
import type { Contact, Entity, Schema } from "~/payload/payload-types";
import { api } from "~/utils/api";
import { authPages } from "~/utils/auth";

interface LibraryPageProps {
	entity: Entity;
}

export default function LibraryPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	const utils = api.useUtils();

	const [contactModalActions] = useState<LibraryContactModalActions>({});
	const [schemaModalActions] = useState<LibrarySchemaModalActions>({});

	const { data: contacts = [] } = api.entityLibrary.listContacts.useQuery({
		entityId: entity.id,
	});
	const { data: schemas = [] } = api.entityLibrary.listSchemas.useQuery({
		entityId: entity.id,
	});

	const refresh = () => {
		utils.entityLibrary.listContacts.invalidate();
		utils.entityLibrary.listSchemas.invalidate();
	};

	const { mutateAsync: deleteContact } =
		api.entityLibrary.deleteContact.useMutation({
			onSuccess: refresh,
			onError: (e) => alert(e.message),
		});
	const { mutateAsync: deleteSchema } =
		api.entityLibrary.deleteSchema.useMutation({
			onSuccess: refresh,
			onError: (e) => alert(e.message),
		});

	const contactColumnHelper = createColumnHelper<Contact>();
	const schemaColumnHelper = createColumnHelper<Schema>();

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
				meta: { styles: { width: 96, justifyContent: "flex-end" } },
				cell: (info) => {
					const contact = info.row.original;
					return (
						<div className={classes.itemActions}>
							<Button
								priority="tertiary no outline"
								iconId="fr-icon-edit-line"
								title="Modifier"
								onClick={() => contactModalActions.open?.(contact)}
							/>
							<Button
								priority="tertiary no outline"
								iconId="fr-icon-delete-line"
								title="Supprimer"
								onClick={() =>
									deleteContact({ id: contact.id, entityId: entity.id })
								}
							/>
						</div>
					);
				},
			}),
		],
		[
			classes.hint,
			classes.itemActions,
			classes.tags,
			deleteContact,
			entity.id,
			contactColumnHelper,
			contactModalActions,
		],
	);

	const schemaColumns = useMemo(
		() => [
			schemaColumnHelper.accessor("schemaName", {
				id: "name",
				cell: (info) => <strong>{info.getValue()}</strong>,
			}),
			schemaColumnHelper.accessor("schemaUrl", {
				id: "url",
				cell: (info) => {
					const url = info.getValue();
					if (!url) return null;
					return <span className={classes.hint}>{url}</span>;
				},
			}),
			schemaColumnHelper.accessor("updatedAt", {
				id: "updatedAt",
				cell: (info) => (
					<span className={classes.hint}>
						Dernière mise à jour{" "}
						{new Date(info.getValue()).toLocaleDateString("fr-FR")}
					</span>
				),
			}),
			schemaColumnHelper.display({
				id: "actions",
				meta: { styles: { width: 96, justifyContent: "flex-end" } },
				cell: (info) => {
					const schema = info.row.original;
					return (
						<div className={classes.itemActions}>
							<Button
								priority="tertiary no outline"
								iconId="fr-icon-edit-line"
								title="Modifier"
								onClick={() => schemaModalActions.open?.(schema)}
							/>
							<Button
								priority="tertiary no outline"
								iconId="fr-icon-delete-line"
								title="Supprimer"
								onClick={() =>
									deleteSchema({ id: schema.id, entityId: entity.id })
								}
							/>
						</div>
					);
				},
			}),
		],
		[
			classes.hint,
			classes.itemActions,
			deleteSchema,
			entity.id,
			schemaColumnHelper,
			schemaModalActions,
		],
	);

	return (
		<>
			<Head>
				<title>Documents partagés - Téléservice Conformité</title>
			</Head>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					<h1>Documents partagés de {entity.name}</h1>
					<p>
						Les contacts et schémas enregistrés ici peuvent être réutilisés sur
						toutes les déclarations de cette administration. Toute modification
						sera répercutée sur les déclarations liées.
					</p>
					<section className={classes.section}>
						<div className={classes.sectionHeader}>
							<h2>Schémas et plans d'actions</h2>
							<Button
								iconId="fr-icon-add-line"
								priority="secondary"
								onClick={() => schemaModalActions.open?.()}
							>
								Ajouter un schéma
							</Button>
						</div>
						{schemas.length === 0 ? (
							<p className={classes.empty}>Aucun schéma enregistré.</p>
						) : (
							<Table
								columns={schemaColumns}
								data={schemas}
								numberPerPage={10}
								hideHeaders
							/>
						)}
					</section>
					<section className={classes.section}>
						<div className={classes.sectionHeader}>
							<h2>Contacts</h2>
							<Button
								iconId="fr-icon-add-line"
								priority="secondary"
								onClick={() => contactModalActions.open?.()}
							>
								Ajouter un contact
							</Button>
						</div>
						{contacts.length === 0 ? (
							<p className={classes.empty}>Aucun contact enregistré.</p>
						) : (
							<Table
								columns={contactColumns}
								data={contacts}
								numberPerPage={10}
								hideHeaders
							/>
						)}
					</section>
					<LibrarySchemaModal
						entityId={entity.id}
						actions={schemaModalActions}
					/>
					<LibraryContactModal
						entityId={entity.id}
						actions={contactModalActions}
					/>
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
	section: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	sectionHeader: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	itemActions: {
		display: "flex",
		gap: fr.spacing("1v"),
	},
	tags: {
		display: "flex",
		gap: fr.spacing("1v"),
		flexWrap: "wrap",
	},
	hint: {
		fontSize: "0.875rem",
		color: fr.colors.decisions.text.mention.grey.default,
	},
	empty: {
		color: fr.colors.decisions.text.mention.grey.default,
		fontStyle: "italic",
	},
});

export const getServerSideProps = (async (context) => {
	const session = await authPages.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) {
		return { redirect: { destination: "/", permanent: false } };
	}

	const payload = await getPayload({ config });
	const user = await payload.findByID({
		collection: "users",
		id: Number(session.user.id),
		depth: 1,
	});

	const entity =
		user?.entity && typeof user.entity === "object" ? user.entity : null;

	if (!entity) {
		return { redirect: { destination: "/dashboard", permanent: false } };
	}

	return { props: { entity } };
}) satisfies GetServerSideProps<LibraryPageProps>;

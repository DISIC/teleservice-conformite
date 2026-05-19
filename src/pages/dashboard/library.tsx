import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import config from "@payload-config";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import EmptyState from "~/components/declaration/EmptyState";
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
	const router = useRouter();

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
					<Button
						priority="secondary"
						onClick={() => router.back()}
						iconId="fr-icon-arrow-left-s-line"
						size="small"
					>
						Retour sur la liste des déclarations
					</Button>
					<div className={classes.headerWrapper}>
						<h1>Documents partagés</h1>
						<Badge noIcon small>
							éditable par tous les membres de l'organisation
						</Badge>
					</div>
					<section className={classes.section}>
						<h2 className={fr.cx("fr-mb-0")}>Schémas et plans d'actions</h2>
						{schemas.length === 0 ? (
							<EmptyState
								description="Ajoutez un schéma pluriannuel et les plans d’action associés"
								ctaProps={{
									children: "Ajouter un schéma pluriannuel",
									onClick: () => schemaModalActions.open?.(),
									iconId: "fr-icon-add-line",
								}}
							/>
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
						<h2 className={fr.cx("fr-mb-0")}>Moyens de contact</h2>
						{contacts.length === 0 ? (
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
	headerWrapper: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
		flexWrap: "wrap",
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
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

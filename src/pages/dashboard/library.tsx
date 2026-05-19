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
import Table from "~/components/system/Table";
import type { Contact, Entity, Schema } from "~/payload/payload-types";
import { api } from "~/utils/api";
import { authPages } from "~/utils/auth";
import { ContactTypeForm } from "~/utils/form/contact/form";
import {
	contactFormOptions,
	type ZContactForm,
} from "~/utils/form/contact/schema";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as EntitySchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions, type ZSchema } from "~/utils/form/schema/schema";

interface LibraryPageProps {
	entity: Entity;
}

export default function LibraryPage({
	entity,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const [editingContactId, setEditingContactId] = useState<number | null>(null);
	const [editingSchemaId, setEditingSchemaId] = useState<number | null>(null);
	const [showContactForm, setShowContactForm] = useState(false);
	const [showSchemaForm, setShowSchemaForm] = useState(false);

	const utils = api.useUtils();

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

	const { mutateAsync: upsertContact } =
		api.entityLibrary.upsertContact.useMutation({
			onSuccess: () => {
				refresh();
				setShowContactForm(false);
				setEditingContactId(null);
			},
		});
	const { mutateAsync: upsertSchema } =
		api.entityLibrary.upsertSchema.useMutation({
			onSuccess: () => {
				refresh();
				setShowSchemaForm(false);
				setEditingSchemaId(null);
			},
		});
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
								onClick={() => {
									setEditingContactId(contact.id);
									setShowContactForm(true);
								}}
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
								onClick={() => {
									setEditingSchemaId(schema.id);
									setShowSchemaForm(true);
								}}
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
		],
	);

	const editingContact = contacts.find((c) => c.id === editingContactId);
	const editingSchema = schemas.find((s) => s.id === editingSchemaId);

	const contactForm = useAppForm({
		...contactFormOptions,
		defaultValues: editingContact
			? {
					name: editingContact.name,
					email: editingContact.email ?? "",
					url: editingContact.url ?? "",
				}
			: contactFormOptions.defaultValues,
		onSubmit: async ({ value }: { value: ZContactForm }) => {
			await upsertContact({
				values: value,
				id: editingContactId ?? undefined,
				entityId: entity.id,
			});
		},
	});

	const schemaFormApi = useAppForm({
		...schemaFormOptions,
		defaultValues: editingSchema
			? {
					schemaName: editingSchema.schemaName,
					schemaUrl: editingSchema.schemaUrl ?? "",
					actionPlanUrls: (editingSchema.actionPlanUrls ?? []).map((i) => ({
						url: i.url,
					})),
				}
			: schemaFormOptions.defaultValues,
		onSubmit: async ({ value }: { value: ZSchema }) => {
			await upsertSchema({
				values: value,
				id: editingSchemaId ?? undefined,
				entityId: entity.id,
			});
		},
	});

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
							{!showSchemaForm && (
								<Button
									iconId="fr-icon-add-line"
									priority="secondary"
									onClick={() => {
										setEditingSchemaId(null);
										setShowSchemaForm(true);
									}}
								>
									Ajouter un schéma
								</Button>
							)}
						</div>
						{showSchemaForm && (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									schemaFormApi.handleSubmit();
								}}
								onInvalid={() => schemaFormApi.validate("submit")}
								className={classes.formCard}
							>
								<EntitySchemaForm form={schemaFormApi} readOnly={false} />
								<schemaFormApi.AppForm>
									<div className={classes.formActions}>
										<schemaFormApi.CancelButton
											label="Annuler"
											ariaLabel="Annuler"
											onClick={() => {
												setShowSchemaForm(false);
												setEditingSchemaId(null);
											}}
											priority="tertiary"
										/>
										<schemaFormApi.SubscribeButton
											label="Enregistrer"
											iconId="fr-icon-check-line"
											iconPosition="right"
										/>
									</div>
								</schemaFormApi.AppForm>
							</form>
						)}

						{schemas.length === 0 && !showSchemaForm ? (
							<p className={classes.empty}>Aucun schéma enregistré.</p>
						) : (
							schemas.length > 0 && (
								<Table
									columns={schemaColumns}
									data={schemas}
									numberPerPage={10}
									hideHeaders
								/>
							)
						)}
					</section>
					<section className={classes.section}>
						<div className={classes.sectionHeader}>
							<h2>Contacts</h2>
							{!showContactForm && (
								<Button
									iconId="fr-icon-add-line"
									priority="secondary"
									onClick={() => {
										setEditingContactId(null);
										setShowContactForm(true);
									}}
								>
									Ajouter un contact
								</Button>
							)}
						</div>
						{showContactForm && (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									contactForm.handleSubmit();
								}}
								onInvalid={() => contactForm.validate("submit")}
								className={classes.formCard}
							>
								<ContactTypeForm form={contactForm} readOnly={false} />
								<contactForm.AppForm>
									<div className={classes.formActions}>
										<contactForm.CancelButton
											label="Annuler"
											ariaLabel="Annuler"
											onClick={() => {
												setShowContactForm(false);
												setEditingContactId(null);
											}}
											priority="tertiary"
										/>
										<contactForm.SubscribeButton
											label="Enregistrer"
											iconId="fr-icon-check-line"
											iconPosition="right"
										/>
									</div>
								</contactForm.AppForm>
							</form>
						)}
						{contacts.length === 0 && !showContactForm ? (
							<p className={classes.empty}>Aucun contact enregistré.</p>
						) : (
							contacts.length > 0 && (
								<Table
									columns={contactColumns}
									data={contacts}
									numberPerPage={10}
									hideHeaders
								/>
							)
						)}
					</section>
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
	formCard: {
		padding: fr.spacing("6v"),
		backgroundColor: fr.colors.decisions.background.alt.grey.default,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3v"),
	},
	formActions: {
		display: "flex",
		justifyContent: "flex-end",
		gap: fr.spacing("2v"),
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

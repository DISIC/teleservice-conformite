import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useRouter } from "next/router";
import Head from "next/head";

import { useAppForm } from "~/utils/form/context";
import { DeclarationContactForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { api } from "~/utils/api";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { ReadOnlyDeclarationContact } from "~/components/declaration/ReadOnlyDeclaration";
import { contactFormOptions } from "~/utils/form/contact/schema";
import { ContactTypeForm } from "~/utils/form/contact/form";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";

export default function ContactPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes, cx } = useStyles();
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const { id, email, url } = declaration?.contact || {};
	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

	const { mutateAsync: updateContact } = api.contact.update.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				contact: result.data,
			}));
			setEditMode(false);
		},
		onError: async (error) => {
			console.error(
				`Error updating contact for declaration with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const { mutateAsync: updateStatus } = api.contact.updateStatus.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				contact: {
					...prev.contact,
					...result.data,
				},
			}));

			router.push(declarationPagePath);
		},
		onError: async (error) => {
			console.error(
				`Error updating contact status for declaration with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	const contactOptions = [email, url].reduce(
		(acc: ("email" | "url")[], option) => {
			if (!option) return acc;

			if (option === email) acc.push("email");
			if (option === url) acc.push("url");

			return acc;
		},
		[],
	);

	if (declaration?.contact) {
		readOnlyFormOptions.defaultValues = {
			...readOnlyFormOptions.defaultValues,
			section: "contact",
			contact: {
				contactOptions,
				contactEmail: email ?? "",
				contactName: url ?? "",
			},
		};
	}

	const updateDeclarationContact = async (
		id: number,
		email: string,
		url: string,
	) => {
		try {
			await updateContact({ id, email, url, declarationId: declaration.id });
		} catch (error) {
			console.error(
				`Error updating contact for declaration with id ${declaration?.id}:`,
				error,
			);
		}
	};

	const { mutateAsync: createContact } = api.contact.create.useMutation({
		onSuccess: async () => {
			if (declaration?.audit && declaration.actionPlan) {
				router.push(`/dashboard/declaration/${declaration.id}/preview`);
				return;
			}

			router.push(`/dashboard/declaration/${declaration.id}`);
		},
		onError: (error) => {
			console.error("Error adding contact:", error);
		},
	});

	const addContact = async ({
		email,
		url,
		declarationId,
	}: { email: string; url: string; declarationId: number }) => {
		try {
			await createContact({ email, url, declarationId });
		} catch (error) {
			console.error("Error adding contact:", error);
		}
	};

	const form = useAppForm({
		...contactFormOptions,
		onSubmit: async ({ value, formApi }) => {
			await addContact({
				email: value?.emailContact ?? "",
				url: value?.contactLink ?? "",
				declarationId: declaration.id,
			});
		},
	});

	const readOnlyForm = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			const data = value.contact.contactOptions?.reduce(
				(acc: { email?: string; url?: string }, option) => {
					if (option === "email") {
						acc.email = value.contact.contactEmail ?? "";
					}
					if (option === "url") {
						acc.url = value.contact.contactName ?? "";
					}
					return acc;
				},
				{},
			);

			await updateDeclarationContact(
				id ?? -1,
				data?.email ?? "",
				data?.url ?? "",
			);
		},
	});

	const updateContactStatus = async () => {
		try {
			await updateStatus({
				declarationId: declaration.id,
				id: declaration?.contact?.id ?? -1,
				status: "default",
			});
		} catch (error) {
			return;
		}
	};

	return (
		<>
			<Head>
				<title>
					Déclaration de {declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Contact"
				breadcrumbLabel={declaration?.name ?? ""}
				showValidateButton={
					!editMode &&
					(declaration?.contact?.status === "fromAI" ||
						declaration?.contact?.status === "fromAra")
				}
				onValidate={updateContactStatus}
				isEditable={!!declaration?.contact}
				editMode={editMode}
				onToggleEdit={onEditInfos}
				isAiGenerated={declaration?.contact?.status === "fromAI"}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();

						if (!declaration?.contact) {
							form.handleSubmit();
						} else {
							readOnlyForm.handleSubmit();
						}
					}}
				>
					{!declaration?.contact ? (
						<>
							<div className={commonClasses.whiteBackground}>
								<ContactTypeForm form={form} />
							</div>
							<form.AppForm>
								<div className={classes.actionButtonsContainer}>
									<form.CancelButton
										label="Retour"
										onClick={() =>
											router.push(`/dashboard/declaration/${declaration.id}`)
										}
										priority="tertiary"
									/>
									<form.SubscribeButton
										label="Continuer"
										iconId="fr-icon-arrow-right-s-line"
										iconPosition="right"
									/>
								</div>
							</form.AppForm>
						</>
					) : (
						<>
							{editMode ? (
								<>
									<div className={commonClasses.whiteBackground}>
										<DeclarationContactForm form={readOnlyForm} />
									</div>
									<readOnlyForm.AppForm>
										<readOnlyForm.SubscribeButton label="Valider" />
									</readOnlyForm.AppForm>
								</>
							) : (
								<div className={commonClasses.whiteBackground}>
									<ReadOnlyDeclarationContact
										declaration={declaration ?? null}
									/>
								</div>
							)}
						</>
					)}
				</form>
			</DeclarationForm>
		</>
	);
}

const useStyles = tss.withName(ContactPage.name).create({
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	return {
		props: {
			declaration: declaration,
		},
	};
};

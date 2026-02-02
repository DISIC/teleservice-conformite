import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useRouter } from "next/router";

import { useAppForm } from "~/utils/form/context";
import { DeclarationContactForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { api } from "~/utils/api";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { ReadOnlyDeclarationContact } from "~/components/declaration/ReadOnlyDeclaration";
import VerifyGeneratedInfoPopUpMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";
import { contactFormOptions } from "~/utils/form/contact/schema";
import { ContactTypeForm } from "~/utils/form/contact/form";

export default function ContactPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes, cx } = useStyles();
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
			const data = value.contact.contactOptions.reduce(
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
				data.email ?? "",
				data.url ?? "",
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
		<section id="contact" className={classes.main}>
			<div className={classes.container}>
				<Breadcrumb
					homeLinkProps={{ href: "/dashboard" }}
					segments={[
						{
							label: declaration?.name ?? "",
							linkProps: { href: declarationPagePath },
						},
					]}
					currentPageLabel="Contact"
				/>
				<div>
					<h1>{declaration?.name ?? ""} - Contact</h1>
					{declaration?.contact?.status === "unverified" && (
						<VerifyGeneratedInfoPopUpMessage />
					)}
				</div>
				<div className={cx(classes.editButtonWrapper, classes.whiteBackground)}>
					<h3 className={classes.description}>
						Verifiez les informations et modifiez-les si necessaire
					</h3>
					{declaration?.contact && (
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					)}
				</div>
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
					<div className={cx(classes.formWrapper, classes.whiteBackground)}>
						{!declaration?.contact ? (
							<ContactTypeForm form={form} />
						) : (
							<>
								{editMode ? (
									<>
										<DeclarationContactForm form={readOnlyForm} />
									</>
								) : (
									<ReadOnlyDeclarationContact
										declaration={declaration ?? null}
									/>
								)}
							</>
						)}
					</div>
					{editMode && (
						<readOnlyForm.AppForm>
							<readOnlyForm.SubscribeButton label="Valider" />
						</readOnlyForm.AppForm>
					)}
					{!declaration?.contact && (
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
									iconId="fr-icon-arrow-right-line"
									iconPosition="right"
								/>
							</div>
						</form.AppForm>
					)}
					{declaration?.contact?.status === "unverified" && !editMode && (
						<div className={classes.validateButton}>
							<Button onClick={updateContactStatus}>
								Valider les informations
							</Button>
						</div>
					)}
				</form>
			</div>
		</section>
	);
}

const useStyles = tss.withName(ContactPage.name).create({
	main: {
		marginBlock: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		paddingBottom: fr.spacing("10v"),
		paddingInline: fr.spacing("10v"),
	},
	container: {
		display: "flex",
		flexDirection: "column",
	},
	editButtonWrapper: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		padding: fr.spacing("10v"),
	},
	description: {
		fontSize: "1rem",
		color: "grey",
	},
	validateButton: {
		marginTop: fr.spacing("4w"),
		display: "flex",
		justifyContent: "flex-end",
	},
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
	},
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

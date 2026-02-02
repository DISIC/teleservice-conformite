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
import ContactForm from "~/components/declaration/ContactForm";
import { api } from "~/utils/api";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { ReadOnlyDeclarationContact } from "~/components/declaration/ReadOnlyDeclaration";
import VerifyGeneratedInfoPopUpMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";
import { Router } from "next/router";

export default function ContactPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes } = useStyles();
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

	const form = useAppForm({
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

	if (!declaration?.contact) {
		return <ContactForm declaration={declaration} />;
	}

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
					{declaration?.contact.status === "unverified" && (
						<VerifyGeneratedInfoPopUpMessage />
					)}
					<div className={classes.headerAction}>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					</div>
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className={classes.formWrapper}>
						{editMode ? (
							<>
								<DeclarationContactForm form={form} />
								<form.AppForm>
									<form.SubscribeButton label="Valider" />
								</form.AppForm>
							</>
						) : (
							<ReadOnlyDeclarationContact declaration={declaration ?? null} />
						)}
						{declaration.contact.status === "unverified" && !editMode && (
							<div className={classes.validateButton}>
								<Button onClick={updateContactStatus}>
									Valider les informations
								</Button>
							</div>
						)}
					</div>
				</form>
			</div>
		</section>
	);
}

const useStyles = tss.withName(ContactPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: fr.spacing("6w"),
	},
	container: {
		display: "flex",
		flexDirection: "column",
	},
	headerAction: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
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

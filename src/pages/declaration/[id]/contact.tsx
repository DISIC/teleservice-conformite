import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";

import type { Declaration } from "~/payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { DeclarationContactForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import ContactForm from "~/components/declaration/ContactForm";
import { getPopulated } from "~/utils/payload-helper";
import { api } from "~/utils/api";
import { getDeclarationById } from "~/utils/payload-helper";
import { contact } from "~/utils/form/contact/schema";

export default function ContactPage({
	declaration,
}: { declaration: Declaration }) {
	const router = useRouter();
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const { id, email, url } = getPopulated(declaration?.contact) || {};

	const { mutateAsync: updateContact } = api.contact.update.useMutation({
		onSuccess: async () => {
			router.reload();
		},
		onError: async (error) => {
			console.error(
				`Error updating contact for declaration with id ${declaration?.id}:`,
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
			await updateContact({ id, email, url });
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

	if (!declaration?.contact) {
		return <ContactForm declarationId={declaration?.id ?? -1} />;
	}

	return (
		<section id="contact" className={classes.main}>
			<div className={classes.container}>
				<div>
					<h1>Contact</h1>
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
						<DeclarationContactForm form={form} readOnly={!editMode} />
						{editMode && (
							<form.AppForm>
								<form.SubscribeButton label={"Valider"} />
							</form.AppForm>
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
		gap: fr.spacing("3w"),
		padding: fr.spacing("4w"),
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
	title: {
		fontSize: "1rem",
		color: fr.colors.decisions.text.mention.grey.default,
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
			redirect: { destination: "/declarations" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/declarations" },
		};
	}

	return {
		props: {
			declaration: declaration,
		},
	};
};

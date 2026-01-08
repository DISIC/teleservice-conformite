import { useRouter } from "next/router";

import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { ContactTypeForm } from "~/utils/form/contact/form";
import { contactFormOptions } from "~/utils/form/contact/schema";
import { api } from "~/utils/api";

export default function ContactForm({
	declarationId,
}: { declarationId: number }) {
	const { classes } = useStyles();
	const router = useRouter();

	const { mutateAsync: createContact } = api.contact.create.useMutation({
		onSuccess: async () => {
			router.push(`/declaration/${declarationId}`);
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
				declarationId,
			});
		},
	});

	return (
		<div className={classes.main}>
			<h2>Plans d'actions</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					<p>Tous les champs sont obligatoires sauf précision contraire</p>
					<ContactTypeForm form={form} />
				</div>
				<form.AppForm>
					<div className={classes.actionButtonsContainer}>
						<form.CancelButton
							label="Retour"
							onClick={() => router.push(`/declaration/${declarationId}`)}
							priority="tertiary"
						/>
						<form.SubscribeButton
							label="Continuer"
							iconId="fr-icon-arrow-right-line"
							iconPosition="right"
						/>
					</div>
				</form.AppForm>
			</form>
		</div>
	);
}

const useStyles = tss.withName(ContactForm.name).create({
	main: {
		marginTop: fr.spacing("6v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		// backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

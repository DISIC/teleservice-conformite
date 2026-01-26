import { useRouter } from "next/router";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { ContactTypeForm } from "~/utils/form/contact/form";
import { contactFormOptions } from "~/utils/form/contact/schema";
import { api } from "~/utils/api";
import type { PopulatedDeclaration } from "~/utils/payload-helper";

export default function ContactForm({
	declaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes } = useStyles();
	const router = useRouter();

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
			</form>
		</div>
	);
}

const useStyles = tss.withName(ContactForm.name).create({
	main: {
		marginBlock: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		// backgroundColor: fr.colors.decisions.background.default.grey.hover,
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

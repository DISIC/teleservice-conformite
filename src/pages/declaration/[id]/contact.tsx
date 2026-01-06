import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";

import type { Declaration } from "~/payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { DeclarationContactForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import ContactForm from "~/components/declaration/ContactForm";
import { getPopulated } from "~/utils/payload-helper";

export default function ContactPage({
	declaration,
}: { declaration: Declaration }) {
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const { email, url } = getPopulated(declaration?.contact) || {};

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

	readOnlyFormOptions.defaultValues.contact = {
		contactOptions,
		contactEmail: email ?? "",
		contactName: getPopulated(declaration?.contact)?.url ?? "",
	};

	const form = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			alert(JSON.stringify(value, null, 2));
		},
	});

	if (!declaration?.actionPlan) {
		return <ContactForm declarationId={declaration?.id ?? -1} />;
	}

	return (
		<section id="contact" className={classes.main}>
			<div className={classes.container}>
				<div className={classes.header}>
					<h2 className={classes.title}>
						Verifiez les informations et modifiez-les si necessaire
					</h2>
					<Button priority="secondary" onClick={onEditInfos}>
						{!editMode ? "Modifier" : "Annuler"}
					</Button>
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
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
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

	try {
		const declaration = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		if (!declaration) {
			return {
				props: {},
				redirect: { destination: "/declarations" },
			};
		}

		return {
			props: {
				declaration,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/declarations" },
			props: {},
		};
	}
};

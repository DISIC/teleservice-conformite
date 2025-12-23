import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";

import type { Declaration } from "payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import {
	DeclarationAuditForm,
	DeclarationGeneralForm,
	// DeclarationSchemaForm,
} from "~/utils/form/declaration/form";
import { contactFormOptions } from "~/utils/form/contact/schema";
import ContactForm from "~/components/declaration/ContactForm";

export default function ContactPage({
	declaration,
}: { declaration: Declaration | null }) {
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	// declarationMultiStepFormOptions.defaultValues.contact = {
	// 	annualSchemaDone: true,
	// 	currentYearSchemaDone: true,
	// 	currentSchemaUrl: "https://www.example.com/schema.pdf",
	// 	currentSchemaFile: new File(["Schema content"], "schema.pdf", {
	// 		type: "application/pdf",
	// 	}),
	// };

	const form = useAppForm({
		...contactFormOptions,
		onSubmit: async ({ value, formApi }) => {
			alert(JSON.stringify(value, null, 2));
		},
	});

	if (!declaration?.actionPlan) {
		return <ContactForm declarationId={declaration?.id} />;
	}

	return (
		<section
			id="contact"
			className={classes.main}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: fr.spacing("6w"),
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
					}}
				>
					<h2 style={{ fontSize: "16px", color: "grey" }}>
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
						{/* <ContactForm form={form} readOnly={!editMode} /> */}
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
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			// redirect: { destination: "/" },
		};
	}

	const payload = await getPayload({ config });

	try {
		const declaration = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		return {
			props: {
				declaration: declaration || null,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			// redirect: { destination: "/" },
			props: {},
		};
	}
};

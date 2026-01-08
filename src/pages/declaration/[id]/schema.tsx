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
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";
import SchemaForm from "~/components/declaration/SchemaForm";
import { getDeclarationById } from "~/utils/payload-helper";

export default function SchemaPage({
	declaration,
}: { declaration: Declaration }) {
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	declarationMultiStepFormOptions.defaultValues.schema = {
		annualSchemaDone: true,
		currentYearSchemaDone: true,
		currentSchemaUrl: "https://www.example.com/schema.pdf",
		currentSchemaFile: new File(["Schema content"], "schema.pdf", {
			type: "application/pdf",
		}),
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "general") {
				formApi.setFieldValue("section", "audit");
			} else {
				alert(JSON.stringify(value, null, 2));
			}
		},
	});

	if (!declaration?.actionPlan) {
		return <SchemaForm declarationId={declaration?.id} />;
	}

	return (
		<section id="schema" className={classes.main}>
			<div className={classes.container}>
				<div className={classes.main}>
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
						{/* <SchemaForm form={form} readOnly={!editMode} /> */}
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

const useStyles = tss.withName(SchemaPage.name).create({
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

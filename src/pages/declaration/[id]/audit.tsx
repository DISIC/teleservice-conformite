import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

import type { Declaration } from "payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { tss } from "tss-react";
import { MultiStep } from "~/components/MultiStep";
import { useAppForm } from "~/utils/form/context";
import { DeclarationAuditForm } from "~/utils/form/declaration/form";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";

type Steps<T> = {
	slug: T;
	title: string;
};

export default function AuditPage() {
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	// declarationMultiStepFormOptions.defaultValues.general = {
	// 	organisation: "Nom de l'administration",
	// 	kind: "website" as const,
	// 	name: "France Titres - Immatriculation",
	// 	url: "https://www.francetitre/immatriculation.gouv.fr",
	// 	domain: "agriculture",
	// };

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

	return (
		<section
			id="audit"
			className={classes.main}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: fr.spacing("6w"),
			}}
		>
			<section id="breadcrumbs">
				<Breadcrumb
					segments={[
						{ label: "Accueil", linkProps: { href: "/" } },
						{ label: "%Nom du service", linkProps: { href: "/" } },
						{
							label: "%Nom de la declaration",
							linkProps: { href: "/declaration/1" },
						},
					]}
					currentPageLabel="Resultat de l'audit"
				/>
			</section>
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
					<DeclarationAuditForm
						form={form}
						readOnly={!editMode}
						isAchievedCondition={false}
					/>
					{editMode && (
						<form.AppForm>
							<form.SubscribeButton label={"Valider"} />
						</form.AppForm>
					)}
				</div>
			</form>
		</section>
	);
}

const useStyles = tss.withName(AuditPage.name).create({
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

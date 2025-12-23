import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/router";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

import type { Declaration } from "payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { tss } from "tss-react";
import { MultiStep } from "~/components/MultiStep";
import { useAppForm } from "~/utils/form/context";
import {
	AuditDateForm,
	ToolsForm,
	CompliantElementsForm,
	NonCompliantElementsForm,
	DisproportionnedChargeForm,
	OptionElementsForm,
	FilesForm,
} from "~/utils/form/audit/form";
import { auditMultiStepFormOptions } from "~/utils/form/audit/schema";

type Steps<T> = {
	slug: T;
	title: string;
};

export default function AuditMultiStepForm() {
	const { classes } = useStyles();
	const router = useRouter();

	const sections: string[] = [
		"auditDate",
		"tools",
		"compliantElements",
		"nonCompliantElements",
		"disproportionnedCharge",
		"optionalElements",
		"files",
	];

	const goToPreviousSection = (currentSection: string): string => {
		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex > 0) {
			return sections[currentIndex - 1] ?? "";
		}
		return "";
	};

	const goToNextSection = (currentSection: string): string => {
		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex < sections.length - 1) {
			return sections[currentIndex + 1] ?? "";
		}
		return "";
	};

	const form = useAppForm({
		...auditMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "files") {
				alert(JSON.stringify(value, null, 2));
			} else {
				const nextSection = goToNextSection(value.section);

				if (nextSection) {
					formApi.setFieldValue("section", nextSection);
				}
			}
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	const steps: Steps<typeof section>[] = [
		{ slug: "auditDate", title: "Date & référentiel RGAA" },
		{ slug: "tools", title: "Outils de test" },
		{ slug: "compliantElements", title: "Échantillon contrôlé" },
		{ slug: "nonCompliantElements", title: "Éléments non conformes" },
		{ slug: "disproportionnedCharge", title: "Charge disproportionnée" },
		{ slug: "optionalElements", title: "Éléments optionnels" },
		{ slug: "files", title: "Fichiers" },
	];

	return (
		<div className={classes.main}>
			<h2>Résultats d’audit</h2>
			<MultiStep steps={steps} currentStep={section}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className={classes.formWrapper}>
						<p>Tous les champs sont obligatoires sauf précision contraire</p>
						{section === "auditDate" && <AuditDateForm form={form} />}
						{section === "tools" && <ToolsForm form={form} />}
						{section === "compliantElements" && (
							<CompliantElementsForm form={form} />
						)}
						{section === "nonCompliantElements" && (
							<NonCompliantElementsForm form={form} />
						)}
						{section === "disproportionnedCharge" && (
							<DisproportionnedChargeForm form={form} />
						)}
						{section === "optionalElements" && (
							<OptionElementsForm form={form} />
						)}
						{section === "files" && <FilesForm form={form} />}
					</div>
					<form.AppForm>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<form.CancelButton
								label="Retour"
								onClick={() => {
									if (section === "auditDate") {
										router.back();
									} else {
										const previousSection = goToPreviousSection(section);
										if (previousSection) {
											form.setFieldValue("section", previousSection);
										}
									}
								}}
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
			</MultiStep>
		</div>
	);
}

const useStyles = tss.withName(AuditMultiStepForm.name).create({
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

import { useRouter } from "next/router";

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
	FilesForm,
} from "~/utils/form/audit/form";
import { auditMultiStepFormOptions } from "~/utils/form/audit/schema";
import { api } from "~/utils/api";
import type { PopulatedDeclaration } from "~/utils/payload-helper";

type Steps<T> = {
	slug: T;
	title: string;
};

export default function AuditMultiStepForm({
	declaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes } = useStyles();
	const router = useRouter();

	const { mutateAsync: createAudit } = api.audit.create.useMutation({
		onSuccess: async () => {
			if (declaration?.contact && declaration.actionPlan) {
				router.push(`/dashboard/declaration/${declaration.id}/preview`);
				return;
			}

			router.push(`/dashboard/declaration/${declaration?.id}`);
		},
		onError: (error) => {
			console.error(
				`Error adding audit for declarationId ${declaration?.id}:`,
				error,
			);
		},
	});

	const sections = [
		"auditDate",
		"tools",
		"compliantElements",
		"nonCompliantElements",
		"files",
	] as const;

	type Section = (typeof sections)[number];

	const goToPreviousSection = (currentSection: Section): Section | null => {
		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex > 0) {
			return sections[currentIndex - 1] ?? null;
		}
		return null;
	};

	const goToNextSection = (currentSection: Section): Section | null => {
		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex < sections.length - 1) {
			return sections[currentIndex + 1] ?? null;
		}
		return null;
	};

	const onClickCancel = () => {
		if (section === "auditDate") {
			router.push(`/dashboard/declaration/${declaration?.id}`);
			return;
		}

		if (section === "tools") {
			form.setFieldValue("technologies", []);
			form.setFieldValue("testEnvironments", []);
		}

		if (section === "nonCompliantElements") {
			form.setFieldValue("nonCompliantElements", "");
			form.setFieldValue("disproportionnedCharge", "");
			form.setFieldValue("optionalElements", "");
		}

		if (section === "files") {
			form.setFieldValue("report", "");
		}

		const previousSection = goToPreviousSection(section);
		if (previousSection) form.setFieldValue("section", previousSection);
	};

	const addAudit = async (auditData: any, declarationId: number) => {
		try {
			const audit = {
				...auditData,
			};

			await createAudit({ ...audit, declarationId: declaration.id });
		} catch (error) {
			console.error("Error adding audit:", error);
		}
	};

	const form = useAppForm({
		...auditMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "files") {
				await addAudit(value, declaration.id);
			} else {
				const nextSection = goToNextSection(value.section as Section);
				if (nextSection) formApi.setFieldValue("section", nextSection);
			}
		},
	});

	const section = useStore(
		form.store,
		(state) => state.values.section as Section,
	);

	const steps: Steps<Section>[] = [
		{ slug: "auditDate", title: "Date & référentiel RGAA" },
		{ slug: "tools", title: "Outils de test" },
		{ slug: "compliantElements", title: "Échantillon contrôlé" },
		{ slug: "nonCompliantElements", title: "Éléments non conformes" },
		{ slug: "files", title: "Fichiers" },
	];

	return (
		<div className={classes.main}>
			<h1>Résultats de l’audit</h1>
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
						{section === "files" && <FilesForm form={form} />}
					</div>
					<form.AppForm>
						<div className={classes.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								onClick={onClickCancel}
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
		marginBlock: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

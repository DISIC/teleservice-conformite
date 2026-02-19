import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import { useStore } from "@tanstack/react-form";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useState } from "react";
import React from "react";
import { tss } from "tss-react";

import Head from "next/head";
import { MultiStep } from "~/components/MultiStep";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { ReadOnlyDeclarationAudit } from "~/components/declaration/ReadOnlyDeclaration";
import {
	type PopulatedDeclaration,
	getDeclarationById,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import {
	AuditDateForm,
	AuditRealisedForm,
	CompliantElementsForm,
	FilesForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/utils/form/audit/form";
import { auditMultiStepFormOptions } from "~/utils/form/audit/schema";
import { useAppForm } from "~/utils/form/context";
import { DeclarationAuditForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";

type Steps<T> = {
	slug: T;
	title: string;
};

const sections = [
	"isAuditRealised",
	"auditDate",
	"tools",
	"compliantElements",
	"nonCompliantElements",
	"files",
] as const;

type Section = (typeof sections)[number];

const steps: Steps<Section>[] = [
	{ slug: "auditDate", title: "Date & référentiel RGAA" },
	{ slug: "tools", title: "Outils de test" },
	{ slug: "compliantElements", title: "Échantillon contrôlé" },
	{ slug: "nonCompliantElements", title: "Éléments non conformes" },
	{ slug: "files", title: "Fichiers" },
];

export default function AuditPage({
	declaration: initialDeclaration,
}: {
	declaration: PopulatedDeclaration;
}) {
	const router = useRouter();
	const { classes, cx } = useStyles();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const [isAchieved, setIsAchieved] = useState(
		!!declaration?.audit && declaration?.audit?.status !== "notRealised",
	);

	const audit = declaration?.audit;
	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

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

	const goToPreviousSection = (currentSection: Section): Section | null => {
		form.reset();

		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex < 0) return null;

		scrollTo(0, 0);

		return sections[currentIndex - 1] ?? null;
	};

	const goToNextSection = (currentSection: Section): Section | null => {
		const currentIndex = sections.indexOf(currentSection);

		if (currentIndex >= sections.length - 1) return null;

		scrollTo(0, 0);

		return sections[currentIndex + 1] ?? null;
	};

	const addAudit = async (auditData: any, declarationId: number) => {
		try {
			const audit = {
				...auditData,
			};

			await createAudit({ ...audit, declarationId });
		} catch (error) {
			console.error("Error adding audit:", error);
		}
	};

	const form = useAppForm({
		...auditMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "isAuditRealised" && !value.isAuditRealised) {
				await addAudit({ status: "notRealised" }, declaration.id);
				return;
			}

			if (value.section === "files") {
				await addAudit(value, declaration.id);
				return;
			}

			const nextSection = goToNextSection(value.section as Section);
			if (nextSection) formApi.setFieldValue("section", nextSection);
		},
	});

	const section = useStore(
		form.store,
		(state) => state.values.section as Section,
	);

	const { mutateAsync: updateAudit } = api.audit.update.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				audit: result.data,
			}));
			setEditMode(false);
		},
		onError: async (error) => {
			console.error(`Error updating audit with id ${audit?.id}`, error);
		},
	});

	const { mutateAsync: deleteAudit } = api.audit.delete.useMutation({
		onSuccess: async () => {
			router.push(declarationPagePath);
		},
		onError: async (error) => {
			console.error(`Error deleting audit with id ${audit?.id}`, error);
		},
	});

	const { mutateAsync: updateStatus } = api.audit.updateStatus.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				audit: {
					...prev.audit,
					...result.data,
				},
			}));

			router.push(declarationPagePath);
		},
		onError: async (error) => {
			console.error(
				`Error updating declaration status with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const onEditInfos = () => {
		setEditMode((prev) => !prev);

		if (editMode)
			setIsAchieved(
				!!declaration?.audit && declaration.audit.status !== "notRealised",
			);
	};

	if (audit) {
		readOnlyFormOptions.defaultValues = {
			...readOnlyFormOptions.defaultValues,
			section: "audit",
			audit: {
				date: audit?.date
					? new Date(audit.date).toISOString().slice(0, 10)
					: "",
				report: audit?.auditReport ?? "",
				realisedBy: audit?.realisedBy ?? "",
				rgaa_version: audit?.rgaa_version ?? "rgaa_4",
				rate: audit?.rate ?? 0,
				compliantElements: audit?.compliantElements ?? "",
				technologies: audit?.technologies?.map((tech) => tech.name) ?? [],
				usedTools: audit?.usedTools?.map((tech) => tech.name) ?? [],
				testEnvironments:
					audit?.testEnvironments?.map((tech) => tech.name) ?? [],
				nonCompliantElements: audit?.nonCompliantElements ?? "",
				disproportionnedCharge: audit?.disproportionnedCharge ?? "",
				optionalElements: audit?.optionalElements ?? "",
			},
		};
	}

	const updateDeclarationAudit = async (auditId: number, auditData: any) => {
		try {
			await updateAudit({
				audit: {
					id: auditId,
					declarationId: declaration.id,
					...auditData,
				},
			});
		} catch (error) {
			console.error(`Error deleting audit with id ${auditId}:`, error);
		}
	};

	const updateAuditStatus = async () => {
		try {
			await updateStatus({
				declarationId: declaration.id,
				id: declaration?.audit?.id ?? -1,
				status: "default",
			});
		} catch (error) {
			return;
		}
	};

	const onClickCancel = () => {
		if (section === "isAuditRealised") {
			router.push(`/dashboard/declaration/${declaration?.id}`);
			return;
		}

		if (section === "tools") {
			form.setFieldValue("usedTools", []);
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

	const readOnlyForm = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (!isAchieved && declaration?.audit) {
				await updateDeclarationAudit(audit?.id ?? -1, {
					status: "notRealised",
				});

				return;
			}

			await updateDeclarationAudit(audit?.id ?? -1, value.audit);
		},
	});

	return (
		<>
			<Head>
				<title>
					Résultat de l’audit - Déclaration de {declaration.name} - Téléservice
					Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Résultat de l’audit"
				breadcrumbLabel={declaration?.name ?? ""}
				isEditable={!!declaration?.audit}
				editMode={editMode}
				onToggleEdit={onEditInfos}
				showValidateButton={
					(declaration?.audit?.status === "fromAI" ||
						declaration?.audit?.status === "fromAra") &&
					!editMode
				}
				onValidate={updateAuditStatus}
				LayoutComponent={({ children }) =>
					declaration?.audit || section === "isAuditRealised" ? (
						children
					) : (
						<MultiStep steps={steps} currentStep={section}>
							{children}
						</MultiStep>
					)
				}
				showLayoutComponent={!declaration?.audit}
				isAiGenerated={declaration?.audit?.status === "fromAI"}
				{...(section === "files"
					? { mentionText: "Les documents ajoutés doivent être accessibles" }
					: undefined)}
			>
				{!declaration?.audit ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						onInvalid={(e) => {
							form.validate("submit");
						}}
					>
						<div className={classes.whiteBackground}>
							{section === "isAuditRealised" && (
								<AuditRealisedForm form={form} />
							)}
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
									ariaLabel="Retour à la déclaration"
								/>
								<form.SubscribeButton
									label="Continuer"
									iconId="fr-icon-arrow-right-s-line"
									iconPosition="right"
								/>
							</div>
						</form.AppForm>
					</form>
				) : (
					<>
						{editMode ? (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									readOnlyForm.handleSubmit();
								}}
								onInvalid={(e) => {
									form.validate("submit");
								}}
							>
								<div className={classes.whiteBackground}>
									<DeclarationAuditForm
										form={readOnlyForm}
										isAchieved={isAchieved}
										onChangeIsAchieved={(value) => setIsAchieved(value)}
									/>
								</div>
								<readOnlyForm.AppForm>
									<readOnlyForm.SubscribeButton label={"Valider"} />
								</readOnlyForm.AppForm>
							</form>
						) : (
							<div className={classes.whiteBackground}>
								<ReadOnlyDeclarationAudit declaration={declaration ?? null} />
							</div>
						)}
					</>
				)}
			</DeclarationForm>
		</>
	);
}

const useStyles = tss.withName(AuditPage.name).create({
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
		paddingInline: fr.spacing("10v"),
		paddingBottom: fr.spacing("10v"),
		marginBottom: fr.spacing("6v"),
		width: "100%",
		display: "flex",
		flexDirection: "column",
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
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

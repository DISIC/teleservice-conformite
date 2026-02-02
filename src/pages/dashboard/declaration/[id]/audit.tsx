import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useStore } from "@tanstack/react-form";

import { useAppForm } from "~/utils/form/context";
import { DeclarationAuditForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { api } from "~/utils/api";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { ReadOnlyDeclarationAudit } from "~/components/declaration/ReadOnlyDeclaration";
import VerifyGeneratedInfoPopUpMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";
import { auditMultiStepFormOptions } from "~/utils/form/audit/schema";
import { MultiStep } from "~/components/MultiStep";
import {
	AuditDateForm,
	ToolsForm,
	CompliantElementsForm,
	NonCompliantElementsForm,
	FilesForm,
} from "~/utils/form/audit/form";

type Steps<T> = {
	slug: T;
	title: string;
};

const sections = [
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
}: { declaration: PopulatedDeclaration }) {
	const router = useRouter();
	const { classes, cx } = useStyles();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const [isAchieved, setIsAchieved] = useState(!!declaration?.audit);
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

		if (editMode) setIsAchieved(!!declaration?.audit);
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
				testEnvironments: audit?.testEnvironments ?? [],
				nonCompliantElements: audit?.nonCompliantElements ?? "",
				disproportionnedCharge: audit?.disproportionnedCharge ?? "",
				optionalElements: audit?.optionalElements ?? "",
			},
		};
	}

	const deleteDeclarationAudit = async (auditId: number) => {
		try {
			await deleteAudit({ id: auditId, declarationId: declaration.id });
		} catch (error) {
			console.error(`Error deleting audit with id ${auditId}:`, error);
		}
	};

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
		if (section === "auditDate") {
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
				await deleteDeclarationAudit(audit?.id ?? -1);

				return;
			}

			await updateDeclarationAudit(audit?.id ?? -1, value.audit);
		},
	});

	return (
		<section id="audit" className={classes.main}>
			<div className={classes.container}>
				<Breadcrumb
					homeLinkProps={{
						href: "/dashboard",
					}}
					segments={[
						{
							label: declaration?.name ?? "",
							linkProps: { href: declarationPagePath },
						},
					]}
					currentPageLabel="Résultat de l’audit"
				/>
				<div>
					<h1>{declaration?.name ?? ""} - Résultat de l’audit</h1>
					{declaration?.audit?.status === "unverified" && (
						<VerifyGeneratedInfoPopUpMessage />
					)}
				</div>
			</div>
			{!declaration?.audit ? (
				<MultiStep steps={steps} currentStep={section}>
					<div
						className={cx(classes.editButtonWrapper, classes.whiteBackground)}
					>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
					</div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<div className={cx(classes.formWrapper, classes.whiteBackground)}>
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
			) : (
				<>
					<div
						className={cx(classes.editButtonWrapper, classes.whiteBackground)}
					>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
						{declaration?.audit && (
							<Button priority="secondary" onClick={onEditInfos}>
								{!editMode ? "Modifier" : "Annuler"}
							</Button>
						)}
					</div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							readOnlyForm.handleSubmit();
						}}
					>
						<div className={cx(classes.formWrapper, classes.whiteBackground)}>
							{editMode ? (
								<DeclarationAuditForm
									form={readOnlyForm}
									isAchieved={isAchieved}
									onChangeIsAchieved={(value) => setIsAchieved(value)}
								/>
							) : (
								<ReadOnlyDeclarationAudit declaration={declaration ?? null} />
							)}
						</div>
						{editMode && (
							<readOnlyForm.AppForm>
								<readOnlyForm.SubscribeButton label={"Valider"} />
							</readOnlyForm.AppForm>
						)}
						{declaration?.audit?.status === "unverified" && !editMode && (
							<div className={classes.validateButton}>
								<Button onClick={updateAuditStatus}>
									Valider les informations
								</Button>
							</div>
						)}
					</form>
				</>
			)}
		</section>
	);
}

const useStyles = tss.withName(AuditPage.name).create({
	main: {
		marginBlock: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
	},
	container: {
		display: "flex",
		flexDirection: "column",
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		paddingBottom: fr.spacing("10v"),
		paddingInline: fr.spacing("10v"),
	},
	editButtonWrapper: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		padding: fr.spacing("10v"),
	},
	description: {
		fontSize: "1rem",
		color: "grey",
	},
	validateButton: {
		marginTop: fr.spacing("4w"),
		display: "flex",
		justifyContent: "flex-end",
	},
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
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

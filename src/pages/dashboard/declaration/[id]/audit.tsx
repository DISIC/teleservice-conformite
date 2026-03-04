import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import { useStore } from "@tanstack/react-form";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useMemo, useState } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { MultiStep } from "~/components/MultiStep";
import { useCommonStyles } from "~/components/style/commonStyles";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import {
	AuditDateForm,
	AuditFlatForm,
	AuditRealisedForm,
	CompliantElementsForm,
	FilesForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/utils/form/audit/form";
import {
	auditFormOptions,
	auditMultiStepFormOptions,
} from "~/utils/form/audit/schema";
import { useAppForm } from "~/utils/form/context";

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
	const { classes: commonClasses } = useCommonStyles();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(!!declaration?.audit);

	const audit = declaration?.audit;

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

	const defaultValues = useMemo(() => {
		if (!audit) return auditMultiStepFormOptions.defaultValues;

		return {
			section: "isAuditRealised" as const,
			isAuditRealised: audit.isRealised ?? undefined,
			rgaa_version:
				rgaaVersionOptions.find((option) => option.value === audit.rgaa_version)
					?.value ?? "rgaa_4",
			realisedBy: audit.realisedBy ?? "",
			rate: audit.rate ?? 0,
			compliantElements: audit.compliantElements ?? "",
			nonCompliantElements: audit.nonCompliantElements ?? "",
			disproportionnedCharge: audit.disproportionnedCharge ?? "",
			optionalElements: audit.optionalElements ?? "",
			usedTools: (audit.usedTools ?? []).map(
				(tool) =>
					toolOptions.find((option) => option.value === tool.name)?.value ?? "",
			),
			testEnvironments: (audit.testEnvironments ?? []).map(
				(env) =>
					testEnvironmentOptions.find((option) => option.value === env.name)
						?.value ?? "",
			),
			report: audit.auditReport ?? "",
		};
	}, [audit]);

	const form = useAppForm({
		...(audit ? auditFormOptions : auditMultiStepFormOptions),
		defaultValues,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "isAuditRealised" && !value.isAuditRealised) {
				await createAudit({
					declarationId: declaration.id,
					isAuditRealised: false,
				});
				return;
			}

			if (value.section === "files") {
				if (audit) {
					await updateAudit({
						audit: {
							id: audit.id,
							declarationId: declaration.id,
							...value,
						},
					});
				} else {
					await createAudit({ ...value, declarationId: declaration.id });
				}
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
			setReadOnly(true);
		},
		onError: async (error) => {
			console.error(`Error updating audit with id ${audit?.id}`, error);
		},
	});

	const onEditInfos = () => setReadOnly((prev) => !prev);

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
				readOnly={readOnly}
				onToggleEdit={onEditInfos}
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
				isAiGenerated={declaration?.fromSource === "ai"}
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
						onInvalid={() => form.validate("submit")}
					>
						<div className={commonClasses.whiteBackground}>
							{section === "isAuditRealised" && (
								<AuditRealisedForm form={form} readOnly={false} />
							)}
							{section === "auditDate" && (
								<AuditDateForm form={form} readOnly={false} />
							)}
							{section === "tools" && (
								<ToolsForm form={form} readOnly={false} />
							)}
							{section === "compliantElements" && (
								<CompliantElementsForm form={form} readOnly={false} />
							)}
							{section === "nonCompliantElements" && (
								<NonCompliantElementsForm form={form} readOnly={false} />
							)}
							{section === "files" && (
								<FilesForm form={form} readOnly={false} />
							)}
						</div>
						<form.AppForm>
							<div className={commonClasses.actionButtonsContainer}>
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
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						onInvalid={() => form.validate("submit")}
					>
						<div className={commonClasses.whiteBackground}>
							<AuditFlatForm form={form} readOnly={readOnly} />
						</div>
						<form.AppForm>
							<form.SubscribeButton label="Valider" />
						</form.AppForm>
					</form>
				)}
			</DeclarationForm>
		</>
	);
}

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

	const declaration = await getDeclarationById(
		payload,
		Number.parseInt(id, 10),
	);

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

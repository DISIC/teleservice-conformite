import { useStore } from "@tanstack/react-form";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useCommonStyles } from "~/components/style/commonStyles";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import {
	type AuditSubSectionSlug,
	isSectionToComplete,
	SECTION_TITLES,
} from "~/utils/declaration/sections";
import { useAppForm } from "~/utils/form/context";
import {
	AuditDateForm,
	AuditRealisedForm,
	CompliantElementsForm,
	FilesForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/utils/form/audit/form";
import {
	type AuditFormSection,
	auditMultiStepFormOptions,
	type ZAuditFormSchema,
} from "~/utils/form/audit/schema";
import { SectionShell } from "./SectionShell";

type AuditSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	currentSubSection: AuditSubSectionSlug;
	prevHref: string | null;
	nextHref: string | null;
};

/**
 * The audit form's `section` field gates which zod sub-schema runs at submit.
 * Pick the validator that matches the user's current sub-section.
 */
const SUB_SECTION_VALIDATOR: Record<AuditSubSectionSlug, AuditFormSection> = {
	"audit-realisation": "isAuditRealised",
	"audit-outils": "tools",
	"audit-contenus": "compliantElements",
	"audit-non-conformites": "nonCompliantElements",
};

export function AuditSection({
	declaration,
	onDeclarationChange,
	currentSubSection,
	prevHref,
	nextHref,
}: AuditSectionProps) {
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const audit = declaration.audit;
	const hasAudit = !!audit;
	const subSectionToComplete = isSectionToComplete(
		declaration,
		currentSubSection,
	);
	const isEditable = hasAudit && !subSectionToComplete;
	const [readOnly, setReadOnly] = useState(isEditable);

	const { mutateAsync: createAudit, isPending: isCreating } =
		api.audit.create.useMutation({
			// `audit.create` returns only the new id, not the full Audit document,
			// so we re-fetch via getServerSideProps to refresh declaration.audit.
			onSuccess: () => router.reload(),
			onError: (error) =>
				console.error(
					`Error creating audit for declaration ${declaration.id}:`,
					error,
				),
		});

	const { mutateAsync: updateAudit, isPending: isUpdating } =
		api.audit.update.useMutation({
			onSuccess: ({ data: updatedAudit }) => {
				onDeclarationChange((prev) => ({ ...prev, audit: updatedAudit }));
				setReadOnly(true);
			},
			onError: (error) =>
				console.error(`Error updating audit with id ${audit?.id}:`, error),
		});

	const isPending = isCreating || isUpdating;

	const defaultValues: ZAuditFormSchema = useMemo(
		() => ({
			section: SUB_SECTION_VALIDATOR[currentSubSection],
			isAuditRealised: audit?.isRealised ?? undefined,
			date: audit?.date ? new Date(audit.date).toLocaleDateString("en-CA") : "",
			rgaa_version:
				rgaaVersionOptions.find((opt) => opt.value === audit?.rgaa_version)
					?.value ?? "rgaa_4",
			realisedBy: audit?.realisedBy ?? "",
			rate: audit?.rate ?? 0,
			compliantElements: audit?.compliantElements ?? "",
			nonCompliantElements: audit?.nonCompliantElements ?? "",
			disproportionnedCharge: audit?.disproportionnedCharge ?? "",
			optionalElements: audit?.optionalElements ?? "",
			usedTools: (audit?.usedTools ?? []).map(
				(tool) =>
					toolOptions.find((opt) => opt.value === tool.name)?.value ??
					tool.name,
			),
			testEnvironments: (audit?.testEnvironments ?? []).map(
				(env) =>
					testEnvironmentOptions.find((opt) => opt.value === env.name)?.value ??
					env.name,
			),
			report: audit?.auditReport ?? "",
		}),
		[audit, currentSubSection],
	);

	const form = useAppForm({
		...auditMultiStepFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!hasAudit) {
				// First-time creation can only happen from audit-realisation
				// (the other sub-sections are hidden in the SideMenu until audit exists).
				if (value.isAuditRealised === false) {
					await createAudit({
						declarationId: declaration.id,
						isAuditRealised: false,
					});
				} else {
					await createAudit({ ...value, declarationId: declaration.id });
				}
				return;
			}

			await updateAudit({
				audit: {
					id: audit.id,
					declarationId: declaration.id,
					...value,
				},
			});
		},
	});

	const isAuditRealisedValue = useStore(
		form.store,
		(state) => state.values.isAuditRealised,
	);

	return (
		<>
			<Head>
				<title>
					{SECTION_TITLES[currentSubSection]} - Déclaration de{" "}
					{declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<SectionShell
				title={SECTION_TITLES[currentSubSection]}
				isEditable={isEditable}
				readOnly={readOnly}
				onEnterEdit={() => setReadOnly(false)}
				onCancelEdit={() => {
					form.reset();
					setReadOnly(true);
				}}
				onSave={() => form.handleSubmit()}
				isSaving={isPending}
				prevHref={prevHref}
				nextHref={nextHref}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={commonClasses.whiteBackground}>
						{currentSubSection === "audit-realisation" && (
							<>
								<AuditRealisedForm form={form} readOnly={readOnly} />
								{isAuditRealisedValue === true && (
									<>
										<AuditDateForm form={form} readOnly={readOnly} />
										<FilesForm form={form} readOnly={readOnly} />
									</>
								)}
							</>
						)}
						{currentSubSection === "audit-outils" && (
							<ToolsForm form={form} readOnly={readOnly} />
						)}
						{currentSubSection === "audit-contenus" && (
							<CompliantElementsForm form={form} readOnly={readOnly} />
						)}
						{currentSubSection === "audit-non-conformites" && (
							<NonCompliantElementsForm form={form} readOnly={readOnly} />
						)}
					</div>
				</form>
			</SectionShell>
		</>
	);
}

import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { useMemo } from "react";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import {
	AUDIT_SUB_SECTIONS,
	type AuditSubSectionSlug,
} from "~/utils/declaration/auditSubSections";
import { isSectionToComplete } from "~/utils/declaration/sections";
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
	auditMultiStepFormOptions,
	type ZAuditFormSchema,
} from "~/utils/form/audit/schema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

type AuditSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	currentSubSection: AuditSubSectionSlug;
	prevHref: string | null;
	nextHref: string | null;
};

export function AuditSection({
	declaration,
	onDeclarationChange,
	currentSubSection,
	prevHref,
	nextHref,
}: AuditSectionProps) {
	const router = useRouter();
	const audit = declaration.audit;
	const hasAudit = !!audit;
	const subSectionToComplete = isSectionToComplete(
		declaration,
		currentSubSection,
	);
	const isEditable = hasAudit && !subSectionToComplete;

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
			onSuccess: ({ data: updatedAudit }) =>
				onDeclarationChange((prev) => ({ ...prev, audit: updatedAudit })),
			onError: (error) =>
				console.error(`Error updating audit with id ${audit?.id}:`, error),
		});

	const isPending = isCreating || isUpdating;

	const { readOnly, exitEdit, Frame } = useSectionForm({
		title: AUDIT_SUB_SECTIONS[currentSubSection].title,
		declaration,
		isEditable,
		initialReadOnly: isEditable,
		isSaving: isPending,
		prevHref,
		nextHref,
	});

	const defaultValues: ZAuditFormSchema = useMemo(
		() => ({
			section: AUDIT_SUB_SECTIONS[currentSubSection].validator,
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
				// onSuccess reloads the page, so no exitEdit() — the next render starts fresh.
				return;
			}

			await updateAudit({
				audit: {
					id: audit.id,
					declarationId: declaration.id,
					...value,
				},
			});
			exitEdit();
		},
	});

	const isAuditRealisedValue = useStore(
		form.store,
		(state) => state.values.isAuditRealised,
	);

	return (
		<Frame form={form}>
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
		</Frame>
	);
}

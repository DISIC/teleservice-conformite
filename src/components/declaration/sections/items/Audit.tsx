import { useMemo } from "react";
import { api } from "~/lib/api";
import {
	AUDIT_SUB_SECTIONS,
	type AuditSubSectionSlug,
} from "~/utils/declaration/auditSubSections";
import { isSectionToComplete } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import {
	AuditGeneralForm,
	CompliantElementsForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/forms/audit/auditForm";
import {
	auditContentsFormOptions,
	auditGeneralFormOptions,
	auditNonConformitiesFormOptions,
	auditToContentsValues,
	auditToGeneralValues,
	auditToNonConformitiesValues,
	auditToolsFormOptions,
	auditToToolsValues,
	type ZAuditContents,
	type ZAuditGeneral,
	type ZAuditNonConformities,
	type ZAuditTools,
} from "~/forms/audit/auditSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";
import { logMutationError } from "~/utils/declaration-helper";
import type { SectionRenderProps } from "../Content";

type UseAuditSubSectionArgs = SectionRenderProps & {
	currentSubSection: AuditSubSectionSlug;
	/** The slice is only meaningful once the audit is realised; otherwise a
	 *  notice replaces the form and the action buttons are hidden. */
	requiresRealised: boolean;
	/** Keep the Sub-section editable regardless of completeness (the general
	 *  Sub-section is always re-answerable). */
	alwaysEditable: boolean;
};

/**
 * Cross-cutting plumbing shared by the four audit Sub-section components: the
 * single `audit.upsert` mutation, the `useSectionForm` frame, and the
 * not-realised notice. The form itself stays in each component.
 */
function useAuditSubSection({
	declaration,
	onDeclarationChange,
	currentSubSection,
	prevHref,
	nextHref,
	requiresRealised,
	alwaysEditable,
	mode,
}: UseAuditSubSectionArgs) {
	const audit = declaration.audit;
	const hasAudit = !!audit;
	const subSectionToComplete = isSectionToComplete(
		declaration,
		currentSubSection,
	);
	const isEditable = alwaysEditable
		? hasAudit
		: hasAudit && !subSectionToComplete;

	// Non-general Sub-sections show a notice (no form, no actions) until the
	// audit is declared as realised.
	const showNotice = requiresRealised && audit?.isRealised !== true;

	const { mutateAsync: upsert, isPending } = api.audit.update.useMutation({
		onSuccess: ({ data }) =>
			onDeclarationChange((prev) => ({ ...prev, audit: data })),
		onError: logMutationError("saving audit", declaration.id),
	});

	const { readOnly, afterSave, Frame } = useSectionForm({
		title: AUDIT_SUB_SECTIONS[currentSubSection].title,
		declaration,
		isEditable,
		isSaving: isPending,
		prevHref,
		nextHref,
		hideActions: showNotice,
		mode,
	});

	return {
		audit,
		hasAudit,
		readOnly,
		afterSave,
		Frame,
		showNotice,
		upsert,
	};
}

export function AuditGeneralSection(props: SectionRenderProps) {
	const { declaration } = props;
	const { audit, readOnly, afterSave, Frame, upsert } = useAuditSubSection({
		...props,
		currentSubSection: "audit-general",
		requiresRealised: false,
		alwaysEditable: true,
	});

	const defaultValues = useMemo(
		(): ZAuditGeneral => auditToGeneralValues(audit),
		[audit],
	);

	const form = useAppForm({
		...auditGeneralFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			const values =
				value.isAuditRealised === false
					? { isRealised: false }
					: {
							isRealised: true,
							date: value.date,
							realisedBy: value.realisedBy,
							rgaa_version: value.rgaa_version,
							rate: value.rate,
						};
			await upsert({ values, declarationId: declaration.id });
			afterSave();
		},
	});

	return (
		<Frame form={form}>
			<AuditGeneralForm form={form} readOnly={readOnly} />
		</Frame>
	);
}

export function AuditOutilsSection(props: SectionRenderProps) {
	const { declaration } = props;
	const { audit, readOnly, afterSave, Frame, showNotice, upsert } =
		useAuditSubSection({
			...props,
			currentSubSection: "audit-outils",
			requiresRealised: true,
			alwaysEditable: false,
		});

	const defaultValues = useMemo(
		(): ZAuditTools => auditToToolsValues(audit),
		[audit],
	);

	const form = useAppForm({
		...auditToolsFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsert({
				values: {
					usedTools: value.usedTools,
					testEnvironments: value.testEnvironments,
				},
				declarationId: declaration.id,
			});
			afterSave();
		},
	});

	return (
		<Frame form={form}>
			<ToolsForm form={form} readOnly={readOnly} showNotice={showNotice} />
		</Frame>
	);
}

export function AuditContenusSection(props: SectionRenderProps) {
	const { declaration } = props;
	const { audit, readOnly, afterSave, Frame, showNotice, upsert } =
		useAuditSubSection({
			...props,
			currentSubSection: "audit-contenus",
			requiresRealised: true,
			alwaysEditable: false,
		});

	const defaultValues = useMemo(
		(): ZAuditContents => auditToContentsValues(audit),
		[audit],
	);

	const form = useAppForm({
		...auditContentsFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsert({
				values: { compliantElements: value.compliantElements },
				declarationId: declaration.id,
			});
			afterSave();
		},
	});

	return (
		<Frame form={form}>
			<CompliantElementsForm
				form={form}
				readOnly={readOnly}
				showNotice={showNotice}
			/>
		</Frame>
	);
}

export function AuditNonConformitesSection(props: SectionRenderProps) {
	const { declaration } = props;
	const { audit, readOnly, afterSave, Frame, showNotice, upsert } =
		useAuditSubSection({
			...props,
			currentSubSection: "audit-non-conformites",
			requiresRealised: true,
			alwaysEditable: false,
		});

	const defaultValues = useMemo(
		(): ZAuditNonConformities => auditToNonConformitiesValues(audit),
		[audit],
	);

	const form = useAppForm({
		...auditNonConformitiesFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsert({
				values: {
					nonCompliantElements: value.nonCompliantElements,
					optionalElements: value.optionalElements,
					disproportionnedCharge: value.disproportionnedCharge,
				},
				declarationId: declaration.id,
			});
			afterSave();
		},
	});

	return (
		<Frame form={form}>
			<NonCompliantElementsForm
				form={form}
				readOnly={readOnly}
				showNotice={showNotice}
			/>
		</Frame>
	);
}

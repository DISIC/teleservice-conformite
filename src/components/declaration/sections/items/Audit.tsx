import type { StandardSchemaV1 } from "@tanstack/react-form";
import type { ComponentProps, ReactNode } from "react";
import type { AuditSubSectionSlug } from "~/domain/declaration/auditSubSections";
import { isSectionToComplete } from "~/domain/declaration/sections";
import {
	AuditGeneralForm,
	CompliantElementsForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/forms/audit/auditForm";
import {
	auditContents,
	auditGeneral,
	auditNonConformities,
	auditToContentsValues,
	auditToGeneralValues,
	auditToNonConformitiesValues,
	auditTools,
	auditToToolsValues,
	type ZAuditContents,
	type ZAuditGeneral,
	type ZAuditNonConformities,
	type ZAuditTools,
} from "~/forms/audit/auditSchema";
import { api } from "~/lib/api";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { SectionPatch } from "~/server/api/utils/section-write";
import { defineSection, type SectionRenderArgs } from "../defineSection";

type Audit = PopulatedDeclaration["audit"];

const isRealised = (declaration: PopulatedDeclaration) =>
	declaration.audit?.isRealised === true;

/**
 * The four Sub-sections are independent forms over the single `audit` group:
 * each maps its own values to a slice of the one `audit.update` patch.
 */
function auditSubSection<TValues, TForm>(config: {
	slug: AuditSubSectionSlug;
	schema: StandardSchemaV1<TValues, unknown>;
	toValues: (audit: Audit) => TValues;
	toPatch: (values: TValues) => SectionPatch<"audit">;
	/** Only meaningful once the audit is realised; a notice replaces the form until then. */
	requiresRealised: boolean;
	autosaveWhen?: (values: TValues) => boolean;
	renderForm: (args: SectionRenderArgs<TForm>) => ReactNode;
}) {
	return defineSection<TValues, TForm>({
		slug: config.slug,
		schema: config.schema,
		toValues: (declaration) => config.toValues(declaration.audit),
		useSave: (declaration, options) => {
			const { mutateAsync, isPending } = api.audit.update.useMutation(options);
			return {
				save: (values) =>
					mutateAsync({
						declarationId: declaration.id,
						values: config.toPatch(values),
					}),
				isPending,
			};
		},
		// The realisation question is always re-answerable; a realised-only slice
		// toggles read-only/edit only once it holds data.
		isEditable: (declaration) =>
			!!declaration.audit &&
			(!config.requiresRealised ||
				!isSectionToComplete(declaration, config.slug)),
		hideActions: config.requiresRealised
			? (declaration) => !isRealised(declaration)
			: undefined,
		autosaveWhen: config.autosaveWhen,
		renderForm: config.renderForm,
	});
}

export const auditGeneralSection = auditSubSection<
	ZAuditGeneral,
	ComponentProps<typeof AuditGeneralForm>["form"]
>({
	slug: "audit-general",
	schema: auditGeneral,
	toValues: auditToGeneralValues,
	toPatch: (value) =>
		value.isAuditRealised === false
			? { isRealised: false }
			: {
					isRealised: true,
					date: value.date,
					realisedBy: value.realisedBy,
					rgaa_version: value.rgaa_version,
					rate: value.rate,
				},
	requiresRealised: false,
	// Hold autosave until the realisation question is answered: an undefined
	// answer would otherwise persist as realised.
	autosaveWhen: (values) => values.isAuditRealised !== undefined,
	renderForm: ({ form, readOnly }) => (
		<AuditGeneralForm form={form} readOnly={readOnly} />
	),
});

export const auditOutilsSection = auditSubSection<
	ZAuditTools,
	ComponentProps<typeof ToolsForm>["form"]
>({
	slug: "audit-outils",
	schema: auditTools,
	toValues: auditToToolsValues,
	toPatch: (value) => ({
		usedTools: value.usedTools,
		testEnvironments: value.testEnvironments,
	}),
	requiresRealised: true,
	renderForm: ({ form, readOnly, declaration }) => (
		<ToolsForm
			form={form}
			readOnly={readOnly}
			showNotice={!isRealised(declaration)}
		/>
	),
});

export const auditContenusSection = auditSubSection<
	ZAuditContents,
	ComponentProps<typeof CompliantElementsForm>["form"]
>({
	slug: "audit-contenus",
	schema: auditContents,
	toValues: auditToContentsValues,
	toPatch: (value) => ({ compliantElements: value.compliantElements }),
	requiresRealised: true,
	renderForm: ({ form, readOnly, declaration }) => (
		<CompliantElementsForm
			form={form}
			readOnly={readOnly}
			showNotice={!isRealised(declaration)}
		/>
	),
});

export const auditNonConformitesSection = auditSubSection<
	ZAuditNonConformities,
	ComponentProps<typeof NonCompliantElementsForm>["form"]
>({
	slug: "audit-non-conformites",
	schema: auditNonConformities,
	toValues: auditToNonConformitiesValues,
	toPatch: (value) => ({
		nonCompliantElements: value.nonCompliantElements,
		optionalElements: value.optionalElements,
		disproportionnedCharge: value.disproportionnedCharge,
	}),
	requiresRealised: true,
	renderForm: ({ form, readOnly, declaration }) => (
		<NonCompliantElementsForm
			form={form}
			readOnly={readOnly}
			showNotice={!isRealised(declaration)}
			showNonConformities={declaration.audit?.rate !== 100}
		/>
	),
});

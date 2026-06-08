import { fr } from "@codegouvfr/react-dsfr";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import Error from "@codegouvfr/react-dsfr/picto/Error";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { type ReactNode, useMemo } from "react";
import { tss } from "tss-react";
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
import { useAppForm } from "~/forms/context";
import {
	AuditDateForm,
	AuditRealisedForm,
	CompliantElementsForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/forms/audit/auditForm";
import {
	auditDate,
	auditMultiStepFormOptions,
	auditRealised,
	compliantElements,
	disproportionnedCharge,
	nonCompliantElements,
	optionalElements,
	tools,
	type ZAuditFormSchema,
} from "~/forms/audit/auditSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

/**
 * The form instance carries every audit field, but each sub-section only edits
 * its own slice. This maps a sub-section to the fields it owns (derived from the
 * per-section zod sub-schemas, so it stays in sync) so a submit sends only those
 * — leaving the other sub-sections' fields absent rather than as empty
 * placeholders the server's partial schema would reject.
 */
const SUB_SECTION_FIELDS: Record<
	AuditSubSectionSlug,
	readonly (keyof ZAuditFormSchema)[]
> = {
	"audit-realisation": [
		...Object.keys(auditRealised.shape),
		...Object.keys(auditDate.shape),
	] as (keyof ZAuditFormSchema)[],
	"audit-outils": Object.keys(tools.shape) as (keyof ZAuditFormSchema)[],
	"audit-contenus": Object.keys(
		compliantElements.shape,
	) as (keyof ZAuditFormSchema)[],
	"audit-non-conformites": [
		...Object.keys(nonCompliantElements.shape),
		...Object.keys(optionalElements.shape),
		...Object.keys(disproportionnedCharge.shape),
	] as (keyof ZAuditFormSchema)[],
};

function pickSubSectionFields(
	value: ZAuditFormSchema,
	subSection: AuditSubSectionSlug,
): Partial<ZAuditFormSchema> {
	const fields = new Set<string>(SUB_SECTION_FIELDS[subSection]);
	return Object.fromEntries(
		Object.entries(value).filter(([key]) => fields.has(key)),
	) as Partial<ZAuditFormSchema>;
}

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
	const { classes } = useStyles();
	const audit = declaration.audit;
	const hasAudit = !!audit;
	const subSectionToComplete = isSectionToComplete(
		declaration,
		currentSubSection,
	);
	const isEditable = hasAudit && !subSectionToComplete;

	// The sub-sections below audit-realisation can only be completed once the
	// audit has been declared as realised. Until then they stay visible in the
	// SideMenu but show a notice instead of their form — with no action buttons.
	const auditRealised = audit?.isRealised === true;
	const showNotice =
		currentSubSection !== "audit-realisation" && !auditRealised;

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
		hideActions: showNotice,
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
			// Only submit the fields the current sub-section owns; the rest stay at
			// their untouched defaults and must not reach the server's partial schema.
			const payload = pickSubSectionFields(value, currentSubSection);
			if (!hasAudit) {
				// First-time creation only happens from audit-realisation. When the
				// audit was not realised, none of the auditDate fields apply.
				if (value.isAuditRealised === false) {
					await createAudit({
						declarationId: declaration.id,
						isAuditRealised: false,
					});
				} else {
					await createAudit({ ...payload, declarationId: declaration.id });
				}
				return;
			}

			await updateAudit({
				audit: {
					id: audit.id,
					declarationId: declaration.id,
					...payload,
				},
			});
			exitEdit();
		},
	});

	const isAuditRealisedValue = useStore(
		form.store,
		(state) => state.values.isAuditRealised,
	);

	const notRealisedNotice = (
		<Notice
			iconDisplayed={false}
			title={
				<span className={classes.noticeTitle}>
					<Error className={classes.noticePictogram} />
					<span className={classes.noticeContent}>
						<span className={classes.noticeHeading}>
							Aucun audit n’a été réalisé.
						</span>
						<span>
							En l’absence d’audit de conformité, cette rubrique n’est pas
							applicable. S’il n’existe aucun résultat d’audit en cours de
							validité permettant de mesurer le respect des critères, le service
							est réputé non conforme.
						</span>
						<a
							href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/conformite/#audit"
							target="_blank"
							rel="noopener noreferrer"
							title="Lien vers le texte de loi, nouvelle fenêtre"
							style={{ width: "fit-content" }}
						>
							Lien vers le texte de loi ↗️
						</a>
					</span>
				</span>
			}
		/>
	);

	const subSectionForm: Record<AuditSubSectionSlug, ReactNode> = {
		"audit-realisation": (
			<>
				<AuditRealisedForm form={form} readOnly={readOnly} />
				{isAuditRealisedValue === true && (
					<AuditDateForm form={form} readOnly={readOnly} />
				)}
			</>
		),
		"audit-outils": <ToolsForm form={form} readOnly={readOnly} />,
		"audit-contenus": <CompliantElementsForm form={form} readOnly={readOnly} />,
		"audit-non-conformites": (
			<NonCompliantElementsForm form={form} readOnly={readOnly} />
		),
	};

	return (
		<Frame form={form}>
			{showNotice ? notRealisedNotice : subSectionForm[currentSubSection]}
		</Frame>
	);
}

const useStyles = tss.withName(AuditSection.name).create({
	noticeTitle: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
		color: fr.colors.decisions.text.default.grey.default,
	},
	noticePictogram: {
		flexShrink: 0,
		width: "3.5rem",
		height: "3.5rem",
	},
	noticeContent: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
		fontWeight: "normal",
	},
	noticeHeading: {
		fontWeight: 700,
	},
});

import { fr } from "@codegouvfr/react-dsfr";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import Error from "@codegouvfr/react-dsfr/picto/Error";
import { type ComponentType, type ReactNode, useMemo } from "react";
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
	AuditGeneralForm,
	CompliantElementsForm,
	NonCompliantElementsForm,
	ToolsForm,
} from "~/forms/audit/auditForm";
import {
	auditContentsFormOptions,
	auditGeneralFormOptions,
	auditNonConformitiesFormOptions,
	auditToolsFormOptions,
	type ZAuditContents,
	type ZAuditGeneral,
	type ZAuditNonConformities,
	type ZAuditTools,
} from "~/forms/audit/auditSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

type AuditNoticeProps = {
	/** DSFR pictogram component (e.g. `Error`). */
	Pictogram: ComponentType<{ className?: string }>;
	heading: ReactNode;
	/** Notice body — description text and any links. */
	children: ReactNode;
};

/**
 * Fixed notice layout (pictogram + heading + body) for audit Sub-sections that
 * are not applicable. Only the content varies between cases — e.g. the
 * "no audit realised" notice or, on the general Sub-section, the
 * `isAuditRealised === false` case.
 */
export function AuditNotice({
	Pictogram,
	heading,
	children,
}: AuditNoticeProps) {
	const { classes } = useStyles();
	return (
		<Notice
			iconDisplayed={false}
			title={
				<span className={classes.noticeTitle}>
					<Pictogram className={classes.noticePictogram} />
					<span className={classes.noticeContent}>
						<span className={classes.noticeHeading}>{heading}</span>
						{children}
					</span>
				</span>
			}
		/>
	);
}

export type AuditSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	prevHref: string | null;
	nextHref: string | null;
};

type UseAuditSubSectionArgs = AuditSectionProps & {
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
 * single `audit.upsert` mutation (refreshing `declaration.audit` in place), the
 * `useSectionForm` frame, and the not-realised notice. The form itself — the one
 * thing that differs per Sub-section — stays in each component (ADR-0002).
 */
function useAuditSubSection({
	declaration,
	onDeclarationChange,
	currentSubSection,
	prevHref,
	nextHref,
	requiresRealised,
	alwaysEditable,
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

	// The non-general Sub-sections can only be completed once the audit has been
	// declared as realised. Until then they stay visible in the SideMenu but show
	// a notice instead of their form — with no action buttons.
	const showNotice = requiresRealised && audit?.isRealised !== true;

	const { mutateAsync: upsert, isPending } = api.audit.upsert.useMutation({
		onSuccess: ({ data }) =>
			onDeclarationChange((prev) => ({ ...prev, audit: data })),
		onError: (error) =>
			console.error(
				`Error saving audit for declaration ${declaration.id}:`,
				error,
			),
	});

	const { readOnly, exitEdit, Frame } = useSectionForm({
		title: AUDIT_SUB_SECTIONS[currentSubSection].title,
		declaration,
		isEditable,
		isSaving: isPending,
		prevHref,
		nextHref,
		hideActions: showNotice,
	});

	const notice: ReactNode = (
		<AuditNotice Pictogram={Error} heading="Aucun audit n’a été réalisé.">
			<span>
				En l’absence d’audit de conformité, cette rubrique n’est pas applicable.
				S’il n’existe aucun résultat d’audit en cours de validité permettant de
				mesurer le respect des critères, le service est réputé non conforme.
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
		</AuditNotice>
	);

	return {
		audit,
		hasAudit,
		readOnly,
		exitEdit,
		Frame,
		showNotice,
		notice,
		upsert,
	};
}

export function AuditGeneralSection(props: AuditSectionProps) {
	const { declaration } = props;
	const { audit, readOnly, exitEdit, Frame, upsert } = useAuditSubSection({
		...props,
		currentSubSection: "audit-general",
		requiresRealised: false,
		alwaysEditable: true,
	});

	const defaultValues = useMemo(
		(): ZAuditGeneral => ({
			isAuditRealised: audit?.isRealised ?? undefined,
			date: audit?.date ? new Date(audit.date).toLocaleDateString("en-CA") : "",
			realisedBy: audit?.realisedBy ?? "",
			rgaa_version:
				rgaaVersionOptions.find((opt) => opt.value === audit?.rgaa_version)
					?.value ?? "rgaa_4",
			rate: audit?.rate ?? 0,
		}),
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
			await upsert({ values, id: audit?.id, declarationId: declaration.id });
			exitEdit();
		},
	});

	return (
		<Frame form={form}>
			<AuditGeneralForm form={form} readOnly={readOnly} />
		</Frame>
	);
}

export function AuditOutilsSection(props: AuditSectionProps) {
	const { declaration } = props;
	const { audit, readOnly, exitEdit, Frame, showNotice, notice, upsert } =
		useAuditSubSection({
			...props,
			currentSubSection: "audit-outils",
			requiresRealised: true,
			alwaysEditable: false,
		});

	const defaultValues = useMemo(
		(): ZAuditTools => ({
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
		}),
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
				id: audit?.id,
				declarationId: declaration.id,
			});
			exitEdit();
		},
	});

	return (
		<Frame form={form}>
			{showNotice ? notice : <ToolsForm form={form} readOnly={readOnly} />}
		</Frame>
	);
}

export function AuditContenusSection(props: AuditSectionProps) {
	const { declaration } = props;
	const { audit, readOnly, exitEdit, Frame, showNotice, notice, upsert } =
		useAuditSubSection({
			...props,
			currentSubSection: "audit-contenus",
			requiresRealised: true,
			alwaysEditable: false,
		});

	const defaultValues = useMemo(
		(): ZAuditContents => ({
			compliantElements: audit?.compliantElements ?? "",
		}),
		[audit],
	);

	const form = useAppForm({
		...auditContentsFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsert({
				values: { compliantElements: value.compliantElements },
				id: audit?.id,
				declarationId: declaration.id,
			});
			exitEdit();
		},
	});

	return (
		<Frame form={form}>
			{showNotice ? (
				notice
			) : (
				<CompliantElementsForm form={form} readOnly={readOnly} />
			)}
		</Frame>
	);
}

export function AuditNonConformitesSection(props: AuditSectionProps) {
	const { declaration } = props;
	const { audit, readOnly, exitEdit, Frame, showNotice, notice, upsert } =
		useAuditSubSection({
			...props,
			currentSubSection: "audit-non-conformites",
			requiresRealised: true,
			alwaysEditable: false,
		});

	const defaultValues = useMemo(
		(): ZAuditNonConformities => ({
			nonCompliantElements: audit?.nonCompliantElements ?? "",
			optionalElements: audit?.optionalElements ?? "",
			disproportionnedCharge: audit?.disproportionnedCharge ?? "",
		}),
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
				id: audit?.id,
				declarationId: declaration.id,
			});
			exitEdit();
		},
	});

	return (
		<Frame form={form}>
			{showNotice ? (
				notice
			) : (
				<NonCompliantElementsForm form={form} readOnly={readOnly} />
			)}
		</Frame>
	);
}

const useStyles = tss.withName("AuditSection").create({
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

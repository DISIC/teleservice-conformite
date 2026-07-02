import { fr } from "@codegouvfr/react-dsfr";
import Error from "@codegouvfr/react-dsfr/picto/Error";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { AuditNotice } from "~/components/ui/AuditNotice";
import type { StandardSchemaV1 } from "@tanstack/react-form";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { tss } from "tss-react";
import { useAppForm } from "~/forms/context";
import { sectionFormOptions } from "~/forms/formOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { EditingMode } from "~/utils/declaration/status";
import {
	SOURCE_MODE_FIELD,
	type SourceModeKind,
} from "~/utils/declaration/sourceMode";
import { useLiveSectionForm } from "~/utils/declaration/useLiveSectionForm";
import { useSectionForm } from "~/utils/declaration/useSectionForm";
import { useSourceMode } from "~/utils/declaration/useSourceMode";
import { usePublishAttempt } from "~/utils/declaration/usePublishAttempt";
import type { DeclarationChangeFn } from "./Content";

export type SourceModeOption = {
	value: "linked" | "custom" | "skipped";
	label: ReactNode;
	hintText?: ReactNode;
	illustration?: ReactNode;
};

type SourceModeSectionProps<TValues, TForm> = {
	kind: SourceModeKind;
	title: string;
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
	mode: EditingMode;
	prevHref: string | null;
	nextHref: string | null;
	schema: StandardSchemaV1<TValues, unknown>;
	toValues: (declaration: PopulatedDeclaration) => TValues;
	/** Persists a custom edit and returns the slice to fold into the declaration. */
	commit: (values: TValues) => Promise<Partial<PopulatedDeclaration>>;
	isSaving: boolean;
	options: SourceModeOption[];
	renderForm: (args: { form: TForm; readOnly: boolean }) => ReactNode;
	/** Terminal Section only (Contact): arms the page-level error summary. */
	onPublishAttempt?: () => void;
};

/**
 * Generic Contact/Schema Section: an explicit Linked/Custom/Skipped radio whose
 * value is derived from persisted state. The radio reveals a Library `<Select>`
 * (Linked), the inline form (Custom), or a skip notice (schema only). With an
 * empty Library the radio collapses to a bare Custom form.
 */
export function SourceModeSection<TValues, TForm>({
	kind,
	title,
	declaration,
	onDeclarationChange,
	mode,
	prevHref,
	nextHref,
	schema,
	toValues,
	commit,
	isSaving,
	options,
	renderForm,
	onPublishAttempt,
}: SourceModeSectionProps<TValues, TForm>) {
	const { classes } = useStyles();
	const isSequential = mode === "sequential";
	const controller = useSourceMode({ kind, declaration, onDeclarationChange });
	const { libraryLink, effectiveMode, isLinked, linkedCount } = controller;
	const { attemptPublish } = usePublishAttempt({
		declaration,
		onPublishAttempt,
	});

	const { readOnly, afterSave, Frame } = useSectionForm({
		title,
		isEditable: true,
		// Sequential mode autosaves silently — no pending indicator.
		isSaving: isSequential ? false : isSaving,
		prevHref,
		nextHref,
		mode,
	});

	const defaultValues = useMemo(
		() => toValues(declaration),
		[declaration, toValues],
	);

	// Only a Custom edit is this section's own work to persist; Linked content is
	// Library-synced and Skipped has nothing to save.
	const isCustomEdit = !isLinked && effectiveMode === "custom";

	const form = useAppForm({
		...sectionFormOptions(isSequential, defaultValues, schema),
		onSubmit: async ({ value }) => {
			const override = isCustomEdit ? await commit(value) : undefined;
			if (onPublishAttempt && isSequential) {
				attemptPublish(override);
				return;
			}
			afterSave();
		},
	});

	// The publish gate is declaration-wide, so it must not stall on this section's
	// own validators; flush any pending custom edit so it validates fresh values.
	const publish = async () => {
		const override = isCustomEdit ? await commit(form.state.values) : undefined;
		attemptPublish(override);
	};

	useLiveSectionForm(form, {
		mode,
		save: commit,
		autosaveWhen: () => isCustomEdit,
	});

	// Realign the form only when a Library link/unlink/skip swaps the persisted
	// source; a custom edit keeps its own live state (autosave + validation).
	const sourceKey = `${effectiveMode ?? ""}:${libraryLink.linkedParentId ?? ""}`;
	const lastSourceKey = useRef(sourceKey);
	useEffect(() => {
		if (lastSourceKey.current === sourceKey) return;
		lastSourceKey.current = sourceKey;
		form.reset(defaultValues);
	}, [sourceKey, defaultValues, form]);

	const hasLibraryItems = libraryLink.items.length > 0;
	const visibleOptions = options.filter(
		(option) => option.value !== "linked" || hasLibraryItems,
	);
	const showRadio = visibleOptions.length >= 2;
	const bodyMode = showRadio ? effectiveMode : "custom";

	const body = (() => {
		switch (bodyMode) {
			case "custom":
				return renderForm({ form: form as unknown as TForm, readOnly });
			case "linked":
				if (!isLinked) return null;
				return (
					<div className={classes.linkedWrapper}>
						{linkedCount !== undefined && (
							<Tag small className={classes.count}>
								{linkedCount > 1
									? `Utilisé par ${linkedCount} déclarations`
									: "Utilisé par cette déclaration"}
							</Tag>
						)}
						{renderForm({ form: form as unknown as TForm, readOnly: true })}
					</div>
				);
			case "skipped":
				return (
					<AuditNotice
						Pictogram={Error}
						heading="Aucun schéma pluriannuel n’a été renseigné."
					>
						<span>
							Vous pouvez publier votre déclaration d’accessibilité, néanmoins
							la loi fait obligation de publier un schéma pluriannuel d’une
							durée de trois ans dans l’objectif d’informer le public des moyens
							et actions mises en place pour rendre les sites et applications
							accessibles à tous.
						</span>
						<a
							href="https://accessibilite.numerique.gouv.fr/obligations/schema-pluriannuel/"
							target="_blank"
							rel="noopener noreferrer"
							title="En savoir plus sur le schéma pluriannuel, nouvelle fenêtre"
							style={{ width: "fit-content" }}
						>
							En savoir plus sur le schéma pluriannuel ↗️
						</a>
					</AuditNotice>
				);
			default:
				return null;
		}
	})();

	return (
		<Frame
			form={form}
			onPublish={onPublishAttempt && isSequential ? publish : undefined}
			hideRequiredNotice={bodyMode !== "custom"}
			before={
				showRadio ? (
					<div
						className={effectiveMode === "linked" ? classes.picker : undefined}
					>
						<RadioButtons
							legend={libraryLink.label}
							disabled={readOnly}
							options={visibleOptions.map((option) => ({
								label: option.label,
								hintText: option.hintText,
								illustration: option.illustration,
								nativeInputProps: {
									name: SOURCE_MODE_FIELD[kind],
									value: option.value,
									checked: effectiveMode === option.value,
									onChange: () => controller.select(option.value),
								},
							}))}
						/>
						{effectiveMode === "linked" && (
							<Select
								label={libraryLink.label}
								nativeSelectProps={{
									value: libraryLink.linkedParentId ?? "",
									onChange: (e) => {
										if (e.target.value)
											libraryLink.onSelect(Number(e.target.value));
									},
								}}
							>
								<option value="" disabled>
									{libraryLink.placeholder}
								</option>
								{libraryLink.items.map((item) => (
									<option key={item.id} value={item.id}>
										{item.label}
										{item.hint ? ` — ${item.hint}` : ""}
									</option>
								))}
							</Select>
						)}
					</div>
				) : undefined
			}
		>
			{body}
		</Frame>
	);
}

const useStyles = tss.withName("SourceModeSection").create({
	picker: {
		paddingBottom: fr.spacing("4v"),
	},
	linkedWrapper: {
		position: "relative",
	},
	count: {
		position: "absolute",
		top: fr.spacing("6v"),
		right: fr.spacing("6v"),
		zIndex: 1,
	},
});

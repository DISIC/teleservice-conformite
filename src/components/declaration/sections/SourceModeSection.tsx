import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { type ReactNode, useEffect, useMemo } from "react";
import { tss } from "tss-react";
import { useAppForm } from "~/forms/context";
import type { submitFormOptions } from "~/forms/formOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { EditingMode } from "~/utils/declaration/status";
import {
	SOURCE_MODE_FIELD,
	type SourceModeKind,
} from "~/utils/declaration/sourceMode";
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
	formOptions: ReturnType<typeof submitFormOptions<TValues>>;
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
	formOptions,
	toValues,
	commit,
	isSaving,
	options,
	renderForm,
	onPublishAttempt,
}: SourceModeSectionProps<TValues, TForm>) {
	const { classes } = useStyles();
	const controller = useSourceMode({ kind, declaration, onDeclarationChange });
	const { attemptPublish } = usePublishAttempt({
		declaration,
		onPublishAttempt,
	});

	const { readOnly, afterSave, Frame } = useSectionForm({
		title,
		declaration,
		isEditable: true,
		isSaving,
		prevHref,
		nextHref,
		mode,
	});

	const defaultValues = useMemo(
		() => toValues(declaration),
		[declaration, toValues],
	);

	const form = useAppForm({
		...formOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			// Linked content is read-only and synced from the Library; only a Custom
			// edit persists here. Skipped/Undecided have nothing to save.
			const override =
				!controller.isLinked && controller.effectiveMode === "custom"
					? await commit(value)
					: undefined;

			if (onPublishAttempt && mode === "sequential") {
				attemptPublish(override);
				return;
			}
			afterSave();
		},
	});

	// Library link/unlink/skip update the declaration in place (no remount), so
	// realign the form with the new persisted values when they change.
	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const { libraryLink, effectiveMode, isLinked, linkedCount } = controller;
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
					<p className={fr.cx("fr-mb-0")}>
						Vous avez indiqué ne pas avoir de schéma pour cette déclaration.
					</p>
				);
			default:
				return null;
		}
	})();

	return (
		<Frame
			form={form}
			before={
				showRadio ? (
					<div className={classes.picker}>
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
		marginBottom: fr.spacing("4v"),
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

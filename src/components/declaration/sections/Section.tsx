import { fr } from "@codegouvfr/react-dsfr";
import Error from "@codegouvfr/react-dsfr/picto/Error";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useStore } from "@tanstack/react-form";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { tss } from "tss-react";
import { logMutationError } from "~/components/declaration/logMutationError";
import { withRequiredMark } from "~/components/form/RequiredField";
import { RequiredFieldsNotice } from "~/components/form/RequiredField";
import { AuditNotice } from "~/components/ui/AuditNotice";
import { useCommonStyles } from "~/components/ui/commonStyles";
import { resolveSectionEditing } from "~/domain/declaration/sectionEditing";
import { SECTIONS } from "~/domain/declaration/sections";
import { SOURCE_MODE_FIELD } from "~/domain/declaration/sourceMode";
import type { EditingMode } from "~/domain/declaration/status";
import { useAppForm } from "~/forms/context";
import { sectionFormOptions } from "~/forms/formOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { applySavedDeclaration } from "./applySavedDeclaration";
import type {
	AnySectionDefinition,
	DeclarationChangeFn,
} from "./defineSection";
import { useAutosave } from "./hooks/useAutosave";
import { usePublishAttempt } from "./hooks/usePublishAttempt";
import { useRevealSectionErrors } from "./hooks/useRevealSectionErrors";
import { useSourceMode } from "./hooks/useSourceMode";
import { SectionShell } from "./Shell";

type SectionProps = {
	definition: AnySectionDefinition;
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
	mode: EditingMode;
	prevHref: string | null;
	nextHref: string | null;
	/** Flips the page's "publish attempted" flag so the error summary appears. */
	onPublishAttempt: () => void;
};

/**
 * The one Section runtime. Mount it once per slug (keyed): edit state never
 * survives a navigation, so switching Sections always lands in read-only.
 */
export function Section({
	definition,
	declaration,
	onDeclarationChange,
	mode,
	prevHref,
	nextHref,
	onPublishAttempt,
}: SectionProps) {
	const { slug, library } = definition;
	const title = SECTIONS[slug].title;
	const router = useRouter();
	const { classes: commonClasses } = useCommonStyles();
	const { classes } = useStyles();
	const isSequential = mode === "sequential";

	const { save, isPending } = definition.useSave(declaration, {
		onSuccess: applySavedDeclaration(onDeclarationChange),
		onError: logMutationError(`saving ${slug}`, declaration.id),
	});
	const source = useSourceMode({
		kind: library?.kind ?? null,
		declaration,
		onDeclarationChange,
	});
	const { attemptPublish } = usePublishAttempt({
		declaration,
		onPublishAttempt,
	});

	const hideActions = definition.hideActions?.(declaration) ?? false;
	const editing = resolveSectionEditing({
		mode,
		isEditable: definition.isEditable?.(declaration) ?? true,
		hideActions,
		isLast: nextHref === null,
		library:
			library && source
				? {
						options: library.options.map((option) => option.value),
						hasLibraryItems: source.libraryLink.items.length > 0,
						effectiveMode: source.effectiveMode,
						isLinked: source.isLinked,
					}
				: null,
	});

	const [readOnly, setReadOnly] = useState(editing.startsReadOnly);

	// Sequential mode advances on a clean save; standalone returns to read-only.
	const afterSave = () => {
		if (!isSequential) {
			setReadOnly(true);
			return;
		}
		if (nextHref)
			router.push(nextHref, undefined, { shallow: true, scroll: false });
	};

	const defaultValues = useMemo(
		() => definition.toValues(declaration),
		[declaration, definition],
	);

	const form = useAppForm({
		...sectionFormOptions(isSequential, defaultValues, definition.schema),
		onSubmit: async ({ value }) => {
			const saved = editing.isCustomEdit ? await save(value) : undefined;
			if (editing.isTerminal) {
				attemptPublish(saved?.data);
				return;
			}
			afterSave();
		},
	});

	// The publish gate is declaration-wide, so it must not stall on this Section's
	// own validators; flush any pending custom edit so it validates fresh values.
	const publish = async () => {
		const saved = editing.isCustomEdit
			? await save(form.state.values)
			: undefined;
		attemptPublish(saved?.data);
	};

	const values = useStore(form.store, (state) => state.values);
	useAutosave({
		enabled: editing.autosave && (definition.autosaveWhen?.(values) ?? true),
		values,
		save,
	});
	useRevealSectionErrors(form);

	// A `?field=` naming the source radio means the publish gate routed here. The
	// page strips the param once it has focused the field, so latch the reveal.
	const [sourceModeRevealed, setSourceModeRevealed] = useState(false);
	useEffect(() => {
		if (library && router.query.field === SOURCE_MODE_FIELD[library.kind]) {
			setSourceModeRevealed(true);
		}
	}, [router.query.field, library]);
	const sourceModeError =
		sourceModeRevealed && editing.bodyMode === null
			? SECTIONS[slug].validation.sourceMode?.message
			: undefined;

	// Realign the form only when a Library link/unlink/skip swaps the persisted
	// source; a custom edit keeps its own live state (autosave + validation).
	const sourceKey = source
		? `${source.effectiveMode ?? ""}:${source.libraryLink.linkedParentId ?? ""}`
		: "";
	const lastSourceKey = useRef(sourceKey);
	useEffect(() => {
		if (lastSourceKey.current === sourceKey) return;
		lastSourceKey.current = sourceKey;
		if (editing.isCustomEdit) return;
		form.reset(defaultValues);
	}, [sourceKey, defaultValues, form, editing.isCustomEdit]);

	const renderForm = (formReadOnly: boolean) =>
		definition.renderForm({ form, readOnly: formReadOnly, declaration, mode });

	const body = (() => {
		switch (editing.bodyMode) {
			case "custom":
				return renderForm(readOnly);
			case "linked":
				if (!source?.isLinked) return null;
				return (
					<div className={classes.linkedWrapper}>
						{source.linkedCount !== undefined && (
							<Tag small className={classes.count}>
								{source.linkedCount > 1
									? `Utilisé par ${source.linkedCount} déclarations`
									: "Utilisé par cette déclaration"}
							</Tag>
						)}
						{renderForm(true)}
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

	const sourcePicker =
		library && source && editing.showRadio ? (
			<div
				className={
					source.effectiveMode === "linked" ? classes.picker : undefined
				}
			>
				<RadioButtons
					legend={withRequiredMark(library.legend, true)}
					disabled={readOnly}
					state={sourceModeError ? "error" : "default"}
					stateRelatedMessage={sourceModeError}
					options={library.options
						.filter((option) => editing.visibleOptions.includes(option.value))
						.map((option) => ({
							label: option.label,
							hintText: option.hintText,
							illustration: option.illustration,
							nativeInputProps: {
								name: SOURCE_MODE_FIELD[library.kind],
								value: option.value,
								checked: source.effectiveMode === option.value,
								onChange: () => source.select(option.value),
							},
						}))}
				/>
				{source.effectiveMode === "linked" && (
					<Select
						label={source.libraryLink.label}
						nativeSelectProps={{
							value: source.libraryLink.linkedParentId ?? "",
							onChange: (e) => {
								if (e.target.value)
									source.libraryLink.onSelect(Number(e.target.value));
							},
						}}
					>
						<option value="" disabled>
							{source.libraryLink.placeholder}
						</option>
						{source.libraryLink.items.map((item) => (
							<option key={item.id} value={item.id}>
								{item.label}
								{item.hint ? ` — ${item.hint}` : ""}
							</option>
						))}
					</Select>
				)}
			</div>
		) : null;

	const hideRequiredNotice =
		!!library && editing.bodyMode !== "custom" && !editing.showRadio;

	return (
		<>
			<Head>
				<title>{title} - Téléservice Conformité</title>
			</Head>
			<SectionShell
				title={title}
				isEditable={definition.isEditable?.(declaration) ?? true}
				readOnly={readOnly}
				onEnterEdit={() => setReadOnly(false)}
				onCancelEdit={() => {
					form.reset();
					setReadOnly(true);
				}}
				onSave={() => form.handleSubmit()}
				onPublish={editing.isTerminal ? publish : undefined}
				// Sequential mode autosaves silently — no pending indicator.
				isSaving={isSequential ? false : isPending}
				prevHref={prevHref}
				nextHref={nextHref}
				hideActions={hideActions}
				mode={mode}
			>
				{!readOnly && !hideRequiredNotice && <RequiredFieldsNotice />}
				{sourcePicker}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={commonClasses.partStack}>{body}</div>
				</form>
			</SectionShell>
		</>
	);
}

const useStyles = tss.withName(Section.name).create({
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

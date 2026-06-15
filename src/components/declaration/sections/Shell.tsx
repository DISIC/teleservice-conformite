import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import type { EditingMode } from "~/utils/declaration/status";

export type SectionShellProps = {
	title: string;
	/**
	 * Whether the underlying data already exists (and therefore can be toggled
	 * between read-only and edit). When false, the section is in initial-fill
	 * mode: `readOnly` should also be false, and the top-right shows only
	 * "Enregistrer" (no "Annuler" — nothing to revert to).
	 */
	isEditable: boolean;
	readOnly: boolean;
	onEnterEdit: () => void;
	onCancelEdit: () => void;
	onSave: () => void;
	isSaving?: boolean;
	prevHref: string | null;
	nextHref: string | null;
	/** Override the "Suivant" label (e.g. "Prévisualiser et publier" on the last section). */
	nextLabel?: string;
	nextIcon?: FrIconClassName | RiIconClassName;
	/**
	 * Hide the top-right action buttons (Modifier/Annuler/Enregistrer) and keep
	 * footer navigation enabled — for purely informational sections that have
	 * nothing to save (e.g. an audit sub-section shown before the audit is
	 * declared as realised).
	 */
	hideActions?: boolean;
	/**
	 * Sequential (Brouillon walkthrough) hides the top-right actions, keeps the
	 * section permanently editable, and turns the footer "Suivant" into an action
	 * button — "Enregistrer et suivant" — that commits the section then advances.
	 * Standalone (default) is the per-section edit/read-only toggle. See ADR-0003.
	 */
	mode?: EditingMode;
	children: ReactNode;
};

export function SectionShell({
	title,
	isEditable,
	readOnly,
	onEnterEdit,
	onCancelEdit,
	onSave,
	isSaving = false,
	prevHref,
	nextHref,
	nextLabel = "Suivant",
	nextIcon = "fr-icon-arrow-right-s-line",
	hideActions = false,
	mode = "standalone",
	children,
}: SectionShellProps) {
	const isEditing = !readOnly;
	const isSequential = mode === "sequential";
	// In sequential mode the footer drives the save, so it stays enabled and
	// "Précédent" is always plain navigation. A nothing-to-save section degrades
	// to a plain "Suivant" link (nothing to commit).
	const sequentialSave = isSequential && !hideActions;
	const navDisabled = !isSequential && isEditing && !hideActions;
	// The last Section of the walkthrough (no `nextHref`) ends with the
	// declaration-wide publish gate instead of a "next" link. `onSave` runs the
	// section's submit, whose success path validates the whole declaration and
	// either routes to preview or back to the first errored Section (ADR-0003).
	const isTerminal = isSequential && !hideActions && !nextHref;
	const { classes, cx } = useStyles();

	return (
		<section className={classes.root}>
			<header className={classes.header}>
				<h2 className={cx(classes.title, fr.cx("fr-h3"))}>{title}</h2>
				<div className={classes.headerActions}>
					{!isSequential && !hideActions && isEditable && readOnly && (
						<Button
							priority="secondary"
							iconId="fr-icon-edit-line"
							onClick={onEnterEdit}
							size="small"
						>
							Modifier
						</Button>
					)}
					{!isSequential && !hideActions && isEditable && isEditing && (
						<Button priority="tertiary" onClick={onCancelEdit} size="small">
							Annuler
						</Button>
					)}
					{!isSequential && !hideActions && isEditing && (
						<Button
							priority="primary"
							iconId="fr-icon-check-line"
							onClick={onSave}
							disabled={isSaving}
							size="small"
						>
							Enregistrer
						</Button>
					)}
				</div>
			</header>
			<div className={classes.body}>{children}</div>
			<footer className={classes.footer}>
				<div className={classes.footerSide}>
					{prevHref &&
						(navDisabled ? (
							<Button
								priority="tertiary"
								iconId="fr-icon-arrow-left-s-line"
								nativeButtonProps={{ disabled: true, "aria-disabled": true }}
							>
								Précédent
							</Button>
						) : (
							<Button
								priority="tertiary"
								iconId="fr-icon-arrow-left-s-line"
								linkProps={{
									href: prevHref,
									scroll: false,
									shallow: true,
								}}
							>
								Précédent
							</Button>
						))}
				</div>
				<div className={classes.footerSide}>
					{isTerminal ? (
						<Button
							priority="primary"
							iconId="fr-icon-upload-fill"
							iconPosition="left"
							onClick={onSave}
							disabled={isSaving}
						>
							Prévisualiser et publier
						</Button>
					) : nextHref ? (
						sequentialSave ? (
							<Button
								priority="primary"
								iconId={nextIcon}
								iconPosition="right"
								onClick={onSave}
								disabled={isSaving}
							>
								Enregistrer et suivant
							</Button>
						) : navDisabled ? (
							<Button
								priority="primary"
								iconId={nextIcon}
								iconPosition="right"
								nativeButtonProps={{ disabled: true, "aria-disabled": true }}
							>
								{nextLabel}
							</Button>
						) : (
							<Button
								priority="primary"
								iconId={nextIcon}
								iconPosition="right"
								linkProps={{
									href: nextHref,
									scroll: false,
									shallow: true,
								}}
							>
								{nextLabel}
							</Button>
						)
					) : null}
				</div>
			</footer>
		</section>
	);
}

const useStyles = tss.withName(SectionShell.name).create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
		width: "100%",
	},
	header: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: fr.spacing("3v"),
	},
	title: {
		margin: 0,
	},
	headerActions: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("3v"),
		alignItems: "center",
	},
	body: {
		display: "flex",
		flexDirection: "column",
	},
	footer: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	footerSide: {
		display: "flex",
	},
});

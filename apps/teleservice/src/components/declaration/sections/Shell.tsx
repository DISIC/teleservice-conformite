import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";
import type { ReactNode } from "react";
import { tss } from "tss-react";
import { EditActionProvider } from "~/components/form/Part";
import type { EditingMode } from "~/domain/declaration/status";

export type SectionShellProps = {
	title: string;
	/** Status flag shown next to the title (e.g. "Non applicable"). */
	badge?: ReactNode;
	/** False while the data doesn't exist yet: no "Annuler", nothing to revert to. */
	isEditable: boolean;
	readOnly: boolean;
	onEnterEdit: () => void;
	onCancelEdit: () => void;
	onSave: () => void;
	/** Terminal publish CTA; bypasses the section form submit when provided. */
	onPublish?: () => void;
	isSaving?: boolean;
	prevHref: string | null;
	nextHref: string | null;
	/** Override the "Suivant" label (e.g. "Prévisualiser et publier" on the last section). */
	nextLabel?: string;
	nextIcon?: FrIconClassName | RiIconClassName;
	/** Nothing to save (e.g. an audit sub-section before the audit is realised). */
	hideActions?: boolean;
	/** Sequential keeps every section editable and commits via the footer;
	 *  standalone toggles edit/read-only per section. */
	mode?: EditingMode;
	children: ReactNode;
};

export function SectionShell({
	title,
	badge,
	isEditable,
	readOnly,
	onEnterEdit,
	onCancelEdit,
	onSave,
	onPublish,
	isSaving = false,
	prevHref,
	nextHref,
	nextLabel = "Suivant",
	nextIcon = "fr-icon-arrow-right-line",
	hideActions = false,
	mode = "standalone",
	children,
}: SectionShellProps) {
	const isEditing = !readOnly;
	const isSequential = mode === "sequential";
	const hasStandaloneActions = !isSequential && !hideActions;
	// Standalone has no autosave, so navigating mid-edit would discard the section;
	// the footer carries only the commit actions until the edit is saved or cancelled.
	const showEditActions = hasStandaloneActions && isEditing;
	// The last Section of the walkthrough ends with the declaration-wide publish
	// gate instead of a "next" link.
	const isTerminal = isSequential && !hideActions && !nextHref;
	const { classes, cx } = useStyles();

	const enterEditButton =
		hasStandaloneActions && isEditable && readOnly ? (
			<Button
				priority="secondary"
				iconId="fr-icon-edit-line"
				onClick={onEnterEdit}
				size="small"
			>
				Modifier
			</Button>
		) : null;

	return (
		<section className={classes.root}>
			<header className={classes.header}>
				<h2 className={cx(classes.title, fr.cx("fr-h3"))}>
					{title}
					{badge}
				</h2>
			</header>
			<div className={classes.body}>
				<EditActionProvider value={enterEditButton}>
					{children}
				</EditActionProvider>
			</div>
			<footer className={classes.footer}>
				{showEditActions ? (
					<div className={classes.footerSide}>
						<Button
							priority="primary"
							iconId="fr-icon-save-line"
							onClick={onSave}
							disabled={isSaving}
							size="small"
						>
							Enregistrer
						</Button>
						{isEditable && (
							<Button
								iconId="fr-icon-arrow-go-back-line"
								priority="tertiary"
								size="small"
								onClick={onCancelEdit}
							>
								Annuler
							</Button>
						)}
					</div>
				) : (
					<>
						<div className={classes.footerSide}>
							{prevHref && (
								<Button
									priority="tertiary"
									iconId="fr-icon-arrow-left-line"
									linkProps={{
										href: prevHref,
										scroll: false,
										shallow: true,
									}}
									size="small"
								>
									Précédent
								</Button>
							)}
						</div>
						<div className={classes.footerSide}>
							{isTerminal ? (
								<Button
									priority="primary"
									iconId="fr-icon-upload-fill"
									iconPosition="left"
									onClick={onPublish ?? onSave}
									disabled={isSaving}
									size="small"
								>
									Prévisualiser et publier
								</Button>
							) : nextHref ? (
								<Button
									priority="primary"
									iconId={nextIcon}
									iconPosition="right"
									linkProps={{
										href: nextHref,
										scroll: false,
										shallow: true,
									}}
									size="small"
								>
									{nextLabel}
								</Button>
							) : null}
						</div>
					</>
				)}
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
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("2v"),
		flexWrap: "wrap",
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
		gap: fr.spacing("3v"),
	},
});

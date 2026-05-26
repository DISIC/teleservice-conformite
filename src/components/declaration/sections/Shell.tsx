import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";
import type { ReactNode } from "react";
import { tss } from "tss-react";

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
	children,
}: SectionShellProps) {
	const isEditing = !readOnly;
	const navDisabled = isEditing;
	const { classes } = useStyles({ readOnly });

	return (
		<section className={classes.root}>
			<header className={classes.header}>
				<h2 className={classes.title}>{title}</h2>
				<div className={classes.headerActions}>
					{isEditable && readOnly && (
						<Button
							priority="secondary"
							iconId="fr-icon-edit-line"
							onClick={onEnterEdit}
						>
							Modifier
						</Button>
					)}
					{isEditable && isEditing && (
						<Button priority="tertiary" onClick={onCancelEdit}>
							Annuler
						</Button>
					)}
					{isEditing && (
						<Button
							priority="primary"
							iconId="fr-icon-check-line"
							onClick={onSave}
							disabled={isSaving}
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
								Retour
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
								Retour
							</Button>
						))}
				</div>
				<div className={classes.footerSide}>
					{nextHref &&
						(navDisabled ? (
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
						))}
				</div>
			</footer>
		</section>
	);
}

const useStyles = tss
	.withName(SectionShell.name)
	.withParams<{ readOnly: boolean }>()
	.create(({ readOnly }) => ({
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
			border: readOnly
				? `1px solid ${fr.colors.decisions.border.default.grey.default}`
				: "none",
			paddingBlock: readOnly ? fr.spacing("4v") : 0,
			paddingInline: readOnly ? fr.spacing("8v") : 0,
		},
		footer: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
		},
		footerSide: {
			display: "flex",
		},
	}));

import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

interface PartProps {
	readOnly: boolean;
	/** Heading shown above the fields, in both edit and read-only modes. */
	title?: ReactNode;
	/**
	 * Lay the read-only fields out in a 2-column grid. Disable for Parts whose
	 * read-only view has a bespoke structure (e.g. checkbox rows, repeaters).
	 * Defaults to true.
	 */
	grid?: boolean;
	children: ReactNode;
}

/**
 * A titled grouping of related fields inside a Sub-section's body. In read-only
 * mode it renders as a self-contained card (border + padding + raised
 * background) and, by default, lays the uniform ReadOnlyFields out in a
 * 2-column grid. In edit mode it is a plain borderless column, with a top rule
 * separating it from a preceding Part so multi-Part bodies read as distinct
 * groups while editing. The optional title renders in both modes.
 */
export function Part({ readOnly, title, grid = true, children }: PartProps) {
	const { classes, cx } = useStyles({ readOnly, grid });

	return (
		<div className={classes.root}>
			{title && (
				<h3
					className={cx(classes.title, fr.cx("fr-h6", !readOnly && "fr-pb-6v"))}
				>
					{title}
				</h3>
			)}
			{children}
		</div>
	);
}

const useStyles = tss
	.withName(Part.name)
	.withParams<{ readOnly: boolean; grid: boolean }>()
	.create(({ readOnly, grid }) => ({
		root: !readOnly
			? {
					display: "flex",
					flexDirection: "column",
					// Separate consecutive editable Parts with a top rule.
					"&:not(:first-child)": {
						borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
						paddingTop: fr.spacing("6v"),
					},
				}
			: {
					border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
					padding: fr.spacing("6v"),
					gap: fr.spacing("6v"),
					backgroundColor: fr.colors.decisions.background.raised.grey.default,
					...(grid
						? {
								display: "grid",
								gridTemplateColumns: "repeat(2, 1fr)",
								"@media (max-width: 1024px)": {
									gridTemplateColumns: "1fr",
								},
							}
						: { display: "flex", flexDirection: "column" }),
				},
		title: {
			margin: 0,
			// In the read-only grid, span the title full width above the fields.
			...(readOnly &&
				grid && { gridColumn: "1 / -1", marginBottom: fr.spacing("2v") }),
		},
	}));

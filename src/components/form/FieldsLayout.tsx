import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

interface FieldsLayoutProps {
	readOnly: boolean;
	/** Heading shown above the fields — read-only mode only. */
	title?: ReactNode;
	/**
	 * Lay the read-only fields out in a 2-column grid. Disable for forms whose
	 * read-only view has a bespoke structure (e.g. checkbox rows, repeaters).
	 * Defaults to true.
	 */
	grid?: boolean;
	children: ReactNode;
}

/**
 * Wraps a section form's fields. In edit mode it is layout-transparent
 * (`display: contents`), so each form keeps its own editing layout. In
 * read-only mode it renders an optional full-width title and, by default,
 * lays the uniform ReadOnlyFields out in a 2-column grid.
 */
export function FieldsLayout({
	readOnly,
	title,
	grid = true,
	children,
}: FieldsLayoutProps) {
	const { classes, cx } = useStyles({ readOnly, grid });

	return (
		<div className={classes.root}>
			{readOnly && title && (
				<h3 className={cx(classes.title, fr.cx("fr-h6"))}>{title}</h3>
			)}
			{children}
		</div>
	);
}

const useStyles = tss
	.withName(FieldsLayout.name)
	.withParams<{ readOnly: boolean; grid: boolean }>()
	.create(({ readOnly, grid }) => ({
		root: !readOnly
			? { display: "contents" }
			: grid
				? {
						display: "grid",
						gridTemplateColumns: "repeat(2, 1fr)",
						gap: fr.spacing("4v"),
						"@media (max-width: 1024px)": {
							gridTemplateColumns: "1fr",
						},
					}
				: {},
		title: {
			margin: 0,
			// Full width above the grid, with a 6v gap before the fields
			// (the grid's 4v row-gap topped up by 2v).
			...(grid && { gridColumn: "1 / -1", marginBottom: fr.spacing("2v") }),
		},
	}));

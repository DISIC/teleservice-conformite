import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useRouter } from "next/router";
import { useState } from "react";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_TITLES, sectionHref } from "~/utils/declaration/sections";
import type { DeclarationError } from "~/utils/declaration/validateDeclaration";

/** Number of error rows shown before the list collapses behind "Voir plus". */
const COLLAPSED_ROWS = 3;

type ErrorSummaryProps = {
	declarationId: PopulatedDeclaration["id"];
	errors: DeclarationError[];
};

/**
 * Live, page-level summary of the declaration-wide publish gate. Rendered only
 * after a publish attempt; it re-derives from the declaration on every save, so
 * it shrinks as Sections are fixed and disappears at zero.
 */
export function ErrorSummary({ declarationId, errors }: ErrorSummaryProps) {
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);
	const { classes, cx } = useStyles();

	const visibleErrors = expanded ? errors : errors.slice(0, COLLAPSED_ROWS);
	const hiddenCount = errors.length - COLLAPSED_ROWS;

	const goToSection = (error: DeclarationError) =>
		router.push(
			sectionHref(declarationId, error.section, error.field),
			undefined,
			{ shallow: true, scroll: false },
		);

	return (
		<Alert
			severity="error"
			closable={false}
			title={
				errors.length > 1
					? `${errors.length} champs doivent être complétés avant la publication`
					: "Un champ doit être complété avant la publication"
			}
			description={
				<div className={classes.body}>
					<ul className={cx(classes.list, expanded && classes.listScroll)}>
						{visibleErrors.map((error) => (
							<li key={`${error.section}.${error.field}`}>
								<button
									type="button"
									className={classes.row}
									onClick={() => goToSection(error)}
								>
									<span className={classes.section}>
										{SECTION_TITLES[error.section]}
									</span>
									<span>{error.message}</span>
								</button>
							</li>
						))}
					</ul>
					{hiddenCount > 0 && (
						<button
							type="button"
							className={classes.toggle}
							onClick={() => setExpanded((prev) => !prev)}
						>
							{expanded ? "Voir moins" : `Voir plus (${hiddenCount})`}
						</button>
					)}
				</div>
			}
		/>
	);
}

const useStyles = tss.withName(ErrorSummary.name).create({
	body: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1v"),
	},
	listScroll: {
		maxHeight: 200,
		overflowY: "auto",
	},
	row: {
		display: "flex",
		flexWrap: "wrap",
		gap: fr.spacing("1w"),
		width: "100%",
		textAlign: "left",
		background: "none",
		border: "none",
		padding: `${fr.spacing("1v")} 0`,
		cursor: "pointer",
		color: "inherit",
		textDecoration: "underline",
		textUnderlineOffset: "2px",
	},
	section: {
		fontWeight: 700,
		whiteSpace: "nowrap",
	},
	toggle: {
		alignSelf: "flex-start",
		background: "none",
		border: "none",
		padding: 0,
		cursor: "pointer",
		color: "inherit",
		fontWeight: 500,
		textDecoration: "underline",
		textUnderlineOffset: "2px",
	},
});

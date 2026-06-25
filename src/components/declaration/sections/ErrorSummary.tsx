import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useRouter } from "next/router";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_TITLES, sectionHref } from "~/utils/declaration/sections";
import type { DeclarationError } from "~/utils/declaration/validateDeclaration";

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
	const { classes } = useStyles();

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
				<ul className={classes.list}>
					{errors.map((error) => (
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
			}
		/>
	);
}

const useStyles = tss.withName(ErrorSummary.name).create({
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1v"),
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
});

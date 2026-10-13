import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { tss } from "tss-react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SECTION_TITLES, sectionHref } from "~/domain/declaration/sections";
import type { DeclarationError } from "~/domain/declaration/validate";

type ErrorSummaryProps = {
	declarationId: PopulatedDeclaration["id"];
	errors: DeclarationError[];
	/** Each new value moves the focus to the summary, so screen readers read it. */
	focusKey: number;
};

/**
 * Live, page-level summary of the declaration-wide publish gate. Rendered only
 * after a publish attempt; it re-derives from the declaration on every save, so
 * it shrinks as Sections are fixed and disappears at zero.
 */
export function ErrorSummary({
	declarationId,
	errors,
	focusKey,
}: ErrorSummaryProps) {
	const { classes } = useStyles();
	const containerRef = useRef<HTMLElement>(null);
	const titleId = useId();

	useEffect(() => {
		containerRef.current?.focus();
	}, [focusKey]);

	return (
		<section
			ref={containerRef}
			tabIndex={-1}
			aria-labelledby={titleId}
			className={classes.container}
		>
			<Alert
				severity="error"
				closable={false}
				title={
					<span id={titleId}>
						{errors.length > 1
							? `${errors.length} champs doivent être complétés avant la publication`
							: "Un champ doit être complété avant la publication"}
					</span>
				}
				description={
					<ul className={classes.list}>
						{errors.map((error) => (
							<li key={`${error.section}.${error.field}`}>
								<Link
									href={sectionHref(declarationId, error.section, error.field)}
									shallow
									scroll={false}
									className={classes.row}
								>
									<span className={classes.section}>
										{SECTION_TITLES[error.section]}
										{error.label && ` › ${error.label}`}
									</span>
									<span>{error.message}</span>
								</Link>
							</li>
						))}
					</ul>
				}
			/>
		</section>
	);
}

const useStyles = tss.withName(ErrorSummary.name).create({
	container: {
		"&:focus": {
			outline: "none",
		},
		"&:focus-visible": {
			outline: `2px solid ${fr.colors.decisions.border.default.blueFrance.default}`,
			outlineOffset: "2px",
		},
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1v"),
	},
	row: {
		display: "flex",
		flexWrap: "wrap",
		gap: fr.spacing("1w"),
		width: "100%",
		textAlign: "left",
		padding: `${fr.spacing("1v")} 0`,
		color: "inherit",
		backgroundImage: "none",
		textDecoration: "underline",
		textUnderlineOffset: "2px",
	},
	section: {
		fontWeight: 700,
		whiteSpace: "nowrap",
	},
});

import { fr } from "@codegouvfr/react-dsfr";

/** A dash for a value that was not filled in; screen readers get a sentence instead. */
export function EmptyValue() {
	return (
		<>
			<span aria-hidden="true">—</span>
			<span className={fr.cx("fr-sr-only")}>Aucune donnée</span>
		</>
	);
}

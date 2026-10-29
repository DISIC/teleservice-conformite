import { fr } from "@codegouvfr/react-dsfr";

/** A dash for a value that was not filled in; screen readers get a sentence instead. */
export function EmptyValue({ label = "Aucune donnée" }: { label?: string }) {
	return (
		<>
			<span aria-hidden="true">—</span>
			<span className={fr.cx("fr-sr-only")}>{label}</span>
		</>
	);
}

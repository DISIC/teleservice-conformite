import Tag from "@codegouvfr/react-dsfr/Tag";

/** Nothing to show while no declaration uses the library item. */
export function LinkedDeclarationsTag({ count }: { count?: number }) {
	if (!count) return null;
	return (
		<Tag small>
			{count === 1
				? "Associé à une déclaration"
				: `Associé à ${count} déclarations`}
		</Tag>
	);
}

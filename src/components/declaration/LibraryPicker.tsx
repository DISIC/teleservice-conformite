import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Select from "@codegouvfr/react-dsfr/Select";
import { tss } from "tss-react";
import type { LibraryLink } from "~/utils/declaration/useLibraryLink";

/**
 * Section Library control (ADR-0004). Two faces:
 *  - linked mode (`linkedParentId` set): a notice that the content mirrors a
 *    Library parent and is read-only here, plus a "Détacher" button to convert
 *    it to an editable custom copy.
 *  - custom mode (editing): a dropdown of the user's Library parents to link one.
 */
export function LibraryPickerSlot({
	link,
	readOnly,
}: {
	link: LibraryLink;
	readOnly: boolean;
}) {
	const { classes } = useStyles();

	if (link.linkedParentId !== null) {
		return (
			<div className={classes.wrapper}>
				<p className={fr.cx("fr-mb-2v")}>
					Ce contenu provient de votre bibliothèque. Il est mis à jour
					automatiquement lorsque vous le modifiez depuis la bibliothèque.
				</p>
				<Button
					priority="secondary"
					size="small"
					iconId="fr-icon-link-unlink"
					onClick={link.onUnlink}
				>
					Détacher pour modifier ici
				</Button>
			</div>
		);
	}

	if (readOnly || link.items.length === 0) return null;

	return (
		<div className={classes.wrapper}>
			<Select
				label={link.label}
				hint="Sélectionnez un élément de votre bibliothèque ou renseignez un nouvel élément ci-dessous."
				nativeSelectProps={{
					value: "",
					onChange: (e) => {
						const value = e.target.value;
						if (value) link.onSelect(Number(value));
					},
				}}
			>
				<option value="" disabled>
					{link.placeholder}
				</option>
				{link.items.map((item) => (
					<option key={item.id} value={item.id}>
						{item.label}
						{item.hint ? ` — ${item.hint}` : ""}
					</option>
				))}
			</Select>
		</div>
	);
}

const useStyles = tss.withName("LibraryPicker").create({
	wrapper: {
		marginBottom: fr.spacing("4v"),
		padding: fr.spacing("4v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		borderRadius: "4px",
	},
});

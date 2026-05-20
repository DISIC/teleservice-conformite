import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/Select";
import { tss } from "tss-react";

interface EntityLibraryPickerProps {
	label: string;
	placeholder: string;
	items: { id: number; label: string; hint?: string }[];
	selectedId: number | null;
	onSelect: (id: number) => void;
}

export default function EntityLibraryPicker({
	label,
	placeholder,
	items,
	selectedId,
	onSelect,
}: EntityLibraryPickerProps) {
	const { classes } = useStyles();

	return (
		<div className={classes.wrapper}>
			<Select
				label={label}
				hint="Sélectionnez un élément partagé par votre administration ou renseignez un nouvel élément ci-dessous."
				nativeSelectProps={{
					value: selectedId ?? "",
					onChange: (e) => {
						const value = e.target.value;
						if (value) onSelect(Number(value));
					},
				}}
			>
				<option value="" disabled>
					{placeholder}
				</option>
				{items.map((item) => (
					<option key={item.id} value={item.id}>
						{item.label}
						{item.hint ? ` — ${item.hint}` : ""}
					</option>
				))}
			</Select>
		</div>
	);
}

const useStyles = tss.withName(EntityLibraryPicker.name).create({
	wrapper: {
		marginBottom: fr.spacing("4v"),
		padding: fr.spacing("4v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		borderRadius: "4px",
	},
});

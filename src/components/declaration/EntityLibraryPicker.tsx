import { fr } from "@codegouvfr/react-dsfr";
import Select from "@codegouvfr/react-dsfr/Select";
import { tss } from "tss-react";
import type { EntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";

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

/**
 * Renders the picker only when there are sibling-administration entries to pick
 * from and the Section is being edited — otherwise nothing. Lets a Section pass
 * `before={<EntityLibraryPickerSlot link={…} readOnly={…} />}` without repeating
 * the visibility guard and prop spread.
 */
export function EntityLibraryPickerSlot({
	link,
	readOnly,
}: {
	link: EntityLibraryLink;
	readOnly: boolean;
}) {
	if (readOnly || link.items.length === 0) return null;
	return (
		<EntityLibraryPicker
			label={link.label}
			placeholder={link.placeholder}
			items={link.items}
			selectedId={link.selectedId}
			onSelect={link.onSelect}
		/>
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

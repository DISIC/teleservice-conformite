import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

export function ItemActions({
	label,
	onEdit,
	onDelete,
}: {
	label: string;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const { classes } = useStyles();
	return (
		<div className={classes.actions}>
			<Button
				priority="tertiary"
				iconId="fr-icon-edit-line"
				title={`Modifier ${label}`}
				size="small"
				onClick={onEdit}
			/>
			<Button
				priority="tertiary"
				iconId="fr-icon-delete-line"
				title={`Supprimer ${label}`}
				size="small"
				onClick={onDelete}
			/>
		</div>
	);
}

const useStyles = tss.withName(ItemActions.name).create({
	actions: {
		display: "flex",
		gap: fr.spacing("4v"),
		justifySelf: "end",
	},
});

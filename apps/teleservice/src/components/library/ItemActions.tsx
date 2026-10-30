import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

export function ItemActions({
	label,
	onEdit,
	onDelete,
	deleteButtonId,
}: {
	label: string;
	onEdit: () => void;
	onDelete: () => void;
	deleteButtonId?: string;
}) {
	const { classes } = useStyles();
	return (
		<div className={classes.actions}>
			<Button
				priority="tertiary"
				iconId="fr-icon-edit-line"
				size="small"
				onClick={onEdit}
				nativeButtonProps={{ "aria-label": `Modifier ${label}` }}
			>
				Modifier
			</Button>
			<Button
				priority="tertiary"
				iconId="fr-icon-delete-line"
				size="small"
				onClick={onDelete}
				nativeButtonProps={{
					id: deleteButtonId,
					"aria-label": `Supprimer ${label}`,
				}}
			>
				Supprimer
			</Button>
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

import Input from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

export function TagGroupField({
	label,
	description,
	disabled,
	className,
	placeholder,
	initialTags,
}: DefaultFieldProps & { initialTags?: string[] }) {
	const { classes, cx } = useStyles();
	const field = useFieldContext<string[]>();
	const [tagInput, setTagInput] = useState<string>("");
	const [tags, setTags] = useState<string[]>(
		initialTags ?? field.state.value ?? [],
	);

	const addTags = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (!tagInput) return;

		const newTags = tagInput.split(",").map((input) => input.trim());
		const allTags = new Set([...tags, ...newTags]);

		setTags([...allTags]);

		field.setValue([...new Set([...(field.state.value ?? []), ...allTags])]);

		setTagInput("");
	};

	return (
		<div className={cx(classes.tagGroupContainer, className)}>
			<div className={classes.inputWrapper}>
				<Input
					label={label}
					hintText={description}
					disabled={disabled}
					nativeInputProps={{
						type: "text",
						name: field.name,
						value: tagInput,
						onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
							setTagInput(e.target.value),
						placeholder,
					}}
				/>
				<Button onClick={addTags} priority="secondary" disabled={disabled}>
					Ajouter
				</Button>
			</div>
			{tags.length > 0 && (
				<div className={classes.tagsContainer}>
					{tags.map((tag) => (
						<Tag
							iconId="fr-icon-close-line"
							key={tag}
							nativeButtonProps={{
								type: "button",
								onClick: () => {
									const newTags = tags.filter((t) => t !== tag);
									setTags(newTags);
									field.setValue([...field.state.value, ...newTags]);
								},
							}}
						>
							{tag}
						</Tag>
					))}
				</div>
			)}
		</div>
	);
}

const useStyles = tss.withName({ TagGroupField }).create({
	tagGroupContainer: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
		marginBottom: fr.spacing("4w"),
	},
	inputWrapper: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		height: "100%",
		alignItems: "flex-end",
		gap: fr.spacing("2v"),
		"& > div": {
			marginBottom: "0 !important",
			width: "100%",
		},
	},
	tagsContainer: {
		display: "flex",
		flexWrap: "wrap",
		gap: fr.spacing("2v"),
	},
});

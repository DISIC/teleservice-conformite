import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input, { type InputProps } from "@codegouvfr/react-dsfr/Input";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useState } from "react";
import { tss } from "tss-react";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";

interface TagGroupFieldProps
	extends DefaultFieldProps,
		Omit<InputProps.Common, "state" | "stateRelatedMessage"> {
	initialTags?: string[];
	nativeInputProps?: InputProps.RegularInput["nativeInputProps"];
}

export function TagGroupField(props: TagGroupFieldProps) {
	const {
		readOnlyField,
		required,
		initialTags,
		nativeInputProps,
		...commonProps
	} = props;
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
		<div className={cx(classes.tagGroupContainer, commonProps.className)}>
			<div className={classes.inputWrapper}>
				<Input
					{...commonProps}
					nativeInputProps={{
						...nativeInputProps,
						name: field.name,
						value: tagInput,
						onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
							setTagInput(e.target.value),
					}}
				/>
				<Button
					onClick={addTags}
					priority="secondary"
					disabled={commonProps.disabled}
				>
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

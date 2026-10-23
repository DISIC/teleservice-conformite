import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input, { type InputProps } from "@codegouvfr/react-dsfr/Input";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useState } from "react";
import { tss } from "tss-react";
import { type DefaultFieldProps, useFieldContext } from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

interface TagGroupFieldProps
	extends
		DefaultFieldProps,
		Omit<InputProps.Common, "state" | "stateRelatedMessage"> {
	/** The chips to show, when the field also holds values shown elsewhere (e.g. checkboxes). */
	tags?: string[];
	nativeInputProps?: InputProps.RegularInput["nativeInputProps"];
}

export function TagGroupField(props: TagGroupFieldProps) {
	const {
		readOnlyField,
		required,
		tags: shownTags,
		nativeInputProps,
		...commonProps
	} = props;
	const { classes, cx } = useStyles();
	const field = useFieldContext<string[]>();
	const [tagInput, setTagInput] = useState<string>("");
	const values = field.state.value ?? [];
	const tags = shownTags ?? values;

	if (readOnlyField) {
		const value = tags.filter((tag) => tag.trim() !== "").join(", ");
		return <ReadOnlyField label={commonProps.label} value={value} />;
	}

	const addTags = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (!tagInput) return;

		const newTags = tagInput
			.split(",")
			.map((input) => input.trim())
			.filter(Boolean);
		field.setValue([...new Set([...values, ...newTags])]);

		setTagInput("");
	};

	return (
		<div className={cx(classes.tagGroupContainer, commonProps.className)}>
			<div className={classes.inputWrapper}>
				<Input
					{...commonProps}
					label={withRequiredMark(commonProps.label, required)}
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
				<ul className={classes.tagsContainer}>
					{tags.map((tag) => (
						<li key={tag}>
							<Tag
								iconId="fr-icon-close-line"
								nativeButtonProps={{
									type: "button",
									onClick: () =>
										field.setValue(values.filter((value) => value !== tag)),
								}}
							>
								{tag}
							</Tag>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

const useStyles = tss.withName({ TagGroupField }).create({
	tagGroupContainer: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
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
		listStyle: "none",
		padding: 0,
		margin: 0,
		marginBottom: fr.spacing("4v"),
		"& > li": {
			padding: 0,
		},
	},
});

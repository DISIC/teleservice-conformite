import { useEffect, useRef, useState } from "react";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

export default function Editable({
	title,
	onEditTitle,
}: { title: string; onEditTitle: (newValue: string) => Promise<void> }) {
	const measureRef = useRef<HTMLSpanElement>(null);
	const { classes } = useStyles();
	const [editableName, setEditableName] = useState<boolean>(true);
	const [newName] = useState<string>(title);
	const [value, setValue] = useState<string>(title);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [inputWidthPx, setInputWidthPx] = useState<number | null>(null);

	useEffect(() => {
		if (!editableName) return;
		const el = nameInputRef.current;
		if (!el) return;

		el.focus({ preventScroll: true });
		const pos = el.value.length;

		try {
			el.setSelectionRange(pos, pos);
		} catch (error) {
			console.error(
				"Error setting cursor position in editable name input",
				error,
			);
		}
	}, [editableName]);

	useEffect(() => {
		if (!editableName) return;
		const m = measureRef.current;
		if (!m) return;
		const width = m.offsetWidth + 2;
		setInputWidthPx(width > 0 ? width : null);
	}, [newName, editableName]);

	return editableName ? (
		<>
			<span
				ref={measureRef}
				className={classes.editableNameInput}
				style={{
					position: "absolute",
					visibility: "hidden",
					whiteSpace: "pre",
				}}
			>
				{newName || " "}
			</span>
			<input
				ref={nameInputRef}
				type="text"
				value={value}
				className={classes.editableNameInput}
				style={{
					width: inputWidthPx ? `${inputWidthPx}px` : "auto",
				}}
				onBlur={() => onEditTitle(value)}
				onKeyUp={(e) => {
					if (e.key === "Enter") onEditTitle(value);

					if (e.key === "Escape") {
						setEditableName(false);
						setValue(newName);
					}
				}}
				onChange={(e) => setValue(e.target.value)}
			/>
		</>
	) : (
		<h1>{newName}</h1>
	);
}

const useStyles = tss.withName(Editable.name).create({
	declarationPage: {
		marginBlock: fr.spacing("10v"),
	},
	headerSection: {
		display: "flex",
		flexDirection: "column",
		alignItems: "start",
		justifyContent: "flex-start",
	},
	header: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		gap: fr.spacing("3v"),
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("4v"),
		marginBottom: fr.spacing("12v"),
	},
	emptyStateContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: fr.spacing("6v"),
		backgroundColor: fr.colors.decisions.background.open.blueFrance.default,
		padding: fr.spacing("6v"),
	},
	dialogActionButton: {
		backgroundColor:
			fr.colors.decisions.background.actionHigh.redMarianne.default,
		color: fr.colors.decisions.text.inverted.info.default,
	},
	tabs: {
		"& > ul > li > button": {
			border: "none !important",
			backgroundColor: "inherit !important",
			backgroundImage: "none !important",

			"&[aria-selected='true']": {
				borderBottom: `3px solid ${fr.colors.decisions.border.actionHigh.blueFrance.default} !important`,
				borderTop: "none !important",
			},
		},

		"& > div": {
			border: "none !important",
			boxShadow: "none !important",
		},
	},
	editableNameInput: {
		outline: "none",
		border: "none",
		fontSize: "2.5rem",
		fontWeight: fr.typography[5].style.fontWeight,
	},
});

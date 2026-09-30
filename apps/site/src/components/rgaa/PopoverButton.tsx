"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useEffect, useId, useRef, useState } from "react";
import { tss } from "tss-react";

export type DisplayOption = "all" | "tests" | "references";

interface PopoverButtonProps {
	onSelect: (option: DisplayOption) => void;
}

export default function PopoverButton({ onSelect }: PopoverButtonProps) {
	const { classes, cx } = useStyles();

	const [open, setOpen] = useState<boolean>(false);

	const popoverRef = useRef<HTMLDivElement>(null);
	const toggleButtonRef = useRef<HTMLButtonElement>(null);
	const popoverId = useId();

	const onOpenPopover = () => {
		setOpen((value) => !value);
	};

	const onSelectOption = (option: DisplayOption) => {
		onSelect(option);
		setOpen(false);
		toggleButtonRef.current?.focus();
	};

	useEffect(() => {
		if (!open) return;

		const onPointerDown = (event: PointerEvent) => {
			if (!popoverRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			setOpen(false);
			toggleButtonRef.current?.focus();
		};

		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<div className={classes.root} ref={popoverRef}>
			<Button
				className={cx(open && classes.toggleButtonOpen)}
				iconId={open ? "ri-close-line" : "ri-arrow-down-s-line"}
				iconPosition="right"
				onClick={onOpenPopover}
				priority="secondary"
				ref={toggleButtonRef}
				nativeButtonProps={{
					"aria-expanded": open,
					"aria-controls": popoverId,
				}}
			>
				Options d’affichage
			</Button>
			<div className={classes.popover} id={popoverId} hidden={!open}>
				<Button onClick={() => onSelectOption("all")}>
					Tout déplier/replier
				</Button>
				<div
					style={{
						width: "100%",
						height: "1px",
						backgroundColor: fr.colors.decisions.border.default.grey.default,
					}}
				/>
				<Button onClick={() => onSelectOption("tests")}>
					Déplier/replier les tests
				</Button>
				<div
					style={{
						width: "100%",
						height: "1px",
						backgroundColor: fr.colors.decisions.border.default.grey.default,
					}}
				/>
				<Button onClick={() => onSelectOption("references")}>
					Déplier/replier les notes et références
				</Button>
			</div>
		</div>
	);
}

const useStyles = tss.withName(PopoverButton.name).create({
	root: {
		position: "relative",
		alignSelf: "flex-end",
	},
	toggleButtonOpen: {
		"&&": {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		},
	},
	popover: {
		position: "absolute",
		zIndex: 1,
		top: "100%",
		right: 0,
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		minWidth: "18rem",
		backgroundColor: fr.colors.decisions.background.overlap.grey.default,
		border: `1px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
		boxShadow: "0px 4px 12px 0px #00001229",
		"&[hidden]": {
			display: "none",
		},
		"& > button": {
			paddingBlock: fr.spacing("3v"),
			paddingInline: fr.spacing("4v"),
			width: "100%",
			textAlign: "left",
			backgroundColor: "inherit",
			color: fr.colors.decisions.text.actionHigh.grey.default,
			display: "inline",
			"--hover-tint": fr.colors.decisions.background.default.grey.hover,
			"--active-tint": fr.colors.decisions.background.default.grey.hover,
		},
	},
});

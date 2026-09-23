"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useEffect, useId, useRef, useState } from "react";
import { tss } from "tss-react";

export type DisplayOption = "all" | "tests" | "references";

interface PopoverButtonProps {
	onValidate: (option: DisplayOption) => void;
}

export default function PopoverButton({ onValidate }: PopoverButtonProps) {
	const { classes, cx } = useStyles();

	const [open, setOpen] = useState<boolean>(false);
	const [value, setValue] = useState<DisplayOption>();

	const popoverRef = useRef<HTMLDivElement>(null);
	const toggleButtonRef = useRef<HTMLButtonElement>(null);
	const popoverId = useId();

	const onOpenPopover = () => {
		setOpen((value) => !value);
	};

	const onClosePopover = () => {
		setOpen(false);
		setValue(undefined);
		toggleButtonRef.current?.focus();
	};

	const onValidatePopover = () => {
		if (!value) return;

		onValidate(value);
		onClosePopover();
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
				<RadioButtons
					options={[
						{
							label: "Tout déplier",
							nativeInputProps: {
								checked: value === "all",
								onChange: () => setValue("all"),
							},
						},
						{
							label: "Déplier les tests",
							nativeInputProps: {
								checked: value === "tests",
								onChange: () => setValue("tests"),
							},
						},
						{
							label: "Déplier les références et notes",
							nativeInputProps: {
								checked: value === "references",
								onChange: () => setValue("references"),
							},
						},
					]}
				/>
				<Button
					onClick={onValidatePopover}
					priority="secondary"
					className={classes.validateButton}
				>
					Valider
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
		padding: fr.spacing("3v"),
		backgroundColor: fr.colors.decisions.background.overlap.grey.default,
		border: `1px solid ${fr.colors.decisions.border.active.blueFrance.default}`,
		boxShadow: "0px 4px 12px 0px #00001229",
		"&[hidden]": {
			display: "none",
		},
	},
	validateButton: {
		width: "100%",
		justifyContent: "center",
	},
});

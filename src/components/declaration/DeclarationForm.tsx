import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import React from "react";

import { useStyles as useAppStyles } from "~/pages/_app";
import VerifyGeneratedInfoHelpingMessage from "./VerifyGeneratedInfoPopUpMessage";

type DeclarationFormProps = {
	declaration: PopulatedDeclaration;
	title: string;
	breadcrumbLabel?: string;
	isEditable?: boolean;
	editMode?: boolean;
	onToggleEdit?: () => void;
	showValidateButton?: boolean;
	onValidate?: () => void;
	children: React.ReactNode;
	LayoutComponent?: React.ComponentType<{ children: React.ReactNode }>;
	showLayoutComponent?: boolean;
	isAiGenerated?: boolean;
	mentionText?: string;
};

export default function DeclarationForm({
	declaration,
	title,
	breadcrumbLabel,
	isEditable,
	editMode,
	onToggleEdit,
	showValidateButton,
	onValidate,
	children,
	LayoutComponent,
	showLayoutComponent = false,
	isAiGenerated = false,
	mentionText,
}: DeclarationFormProps) {
	const { classes, cx } = useStyles();
	const { classes: formClasses } = useAppStyles();
	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

	const Layout =
		showLayoutComponent && LayoutComponent ? LayoutComponent : React.Fragment;

	const Content = () => (
		<div className={cx(classes.formWrapper)}>
			<div className={classes.editButtonWrapper}>
				<h2 className={cx(classes.description, fr.cx("fr-text--sm"))}>
					{isEditable
						? "Vérifiez les informations et modifiez-les si nécessaire"
						: "Tous les champs sont obligatoires sauf précision contraire"}
					{mentionText && (
						<>
							<br />
							{mentionText}
						</>
					)}
				</h2>
				{isEditable && onToggleEdit && (
					<Button
						priority="secondary"
						onClick={onToggleEdit}
						{...(!editMode && { iconId: "fr-icon-edit-line" })}
					>
						{!editMode ? "Modifier" : "Annuler"}
					</Button>
				)}
			</div>
			{children}
		</div>
	);

	return (
		<section className={fr.cx("fr-container")}>
			<div className={cx(classes.main, formClasses.formContainer)}>
				<Breadcrumb
					homeLinkProps={{ href: "/dashboard" }}
					segments={
						breadcrumbLabel
							? [
									{
										label: breadcrumbLabel,
										linkProps: { href: declarationPagePath },
									},
								]
							: []
					}
					currentPageLabel={title}
				/>
				<div>
					<h1>
						{breadcrumbLabel ?? ""} - {title}
					</h1>
				</div>
				{
					<Layout>
						<Content />
					</Layout>
				}
				{showValidateButton && onValidate && (
					<div className={classes.validateButton}>
						<Button onClick={onValidate}>Valider les informations</Button>
					</div>
				)}
			</div>
		</section>
	);
}

const useStyles = tss.withName(DeclarationForm.name).create({
	main: {
		display: "flex",
		flexDirection: "column",
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
	},
	editButtonWrapper: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
		padding: fr.spacing("10v"),
		marginTop: fr.spacing("6v"),
	},
	description: {
		color: fr.colors.decisions.text.mention.grey.default,
		margin: 0,
		fontWeight: 400,
	},
	validateButton: {
		marginTop: fr.spacing("4w"),
		display: "flex",
		justifyContent: "flex-end",
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

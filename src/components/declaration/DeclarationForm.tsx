import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import React from "react";

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
}: DeclarationFormProps) {
	const { classes, cx } = useStyles();
	const router = useRouter();

	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

	const Layout =
		showLayoutComponent && LayoutComponent ? LayoutComponent : React.Fragment;

	const Content = () => (
		<div className={cx(classes.formWrapper)}>
			<div className={classes.editButtonWrapper}>
				<h3 className={classes.description}>
					{isEditable
						? "Vérifiez les informations et modifiez-les si nécessaire"
						: "Tous les champs sont obligatoires sauf précision contraire"}
				</h3>
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
		<section className={classes.main}>
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
		</section>
	);
}

const useStyles = tss.withName(DeclarationForm.name).create({
	main: {
		marginBlock: fr.spacing("10v"),
		marginInline: "23.75rem",
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
		fontSize: "1rem",
		color: "grey",
		margin: 0,
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

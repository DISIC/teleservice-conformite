import { useState } from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

const inviteMembersModal = createModal({
	id: "inviteMembersModal",
	isOpenedByDefault: false,
});

interface MembresProps {
	declaration: PopulatedDeclaration;
}

export default function Membres({ declaration }: MembresProps) {
	const [value, setValue] = useState<"reader" | "admin">("admin");
	const { classes } = useStyles();
	const { name, email } = declaration?.created_by || {};

	const StatusBadge = ({ status }: { status: string }) => {
		switch (status) {
			case "admin":
				return (
					<Badge key="status" className={classes.adminBadge}>
						Administrateur
					</Badge>
				);
			default:
				return (
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Badge key="status" className={classes.readerBadge}>
							Lecteur
						</Badge>
						<div className={classes.buttonsContainer}>
							<Button
								size="small"
								priority="tertiary"
								className={classes.button}
							>
								Retirer l’accès
							</Button>
							<Button
								size="small"
								priority="tertiary"
								className={classes.button}
							>
								Renvoyer l'invitation
							</Button>
						</div>
					</div>
				);
		}
	};

	return (
		<section id="members-tab">
			<div className={classes.modal}>
				<Button
					priority="secondary"
					iconId="fr-icon-user-add-line"
					onClick={() => inviteMembersModal.open()}
				>
					Inviter un membre
				</Button>
				<inviteMembersModal.Component
					buttons={[
						{
							children: "Annuler",
						},
						{
							children: "Inviter",
						},
					]}
					title={
						<section id="modal-header">
							<h1 className={classes.modalHeading}>Inviter un membre</h1>
							<p className={classes.modalSubheading}>
								Tous les champs sont obligatoires
							</p>
						</section>
					}
				>
					<form>
						<Input
							hintText="Format attendu : nom@domaine.fr"
							label="Adresse e-mail"
							state="default"
							stateRelatedMessage="Text de validation / d'explication de l'erreur"
						/>

						<RadioButtons
							legend="Rôle"
							name="my-radio"
							options={[
								{
									hintText:
										"Peut voir les informations de la déclaration, mais ne peut pas faire de modification ou inviter d’autres membres",
									label: "Lecteur",
									nativeInputProps: {
										value: "reader",
										checked: value === "reader",
										onChange: () => setValue("reader"),
										disabled: true,
									},
								},
								{
									hintText:
										"Peut modifier tout aspect de la déclaration et inviter de nouveaux membres",
									label: "Administrateur",
									nativeInputProps: {
										value: "admin",
										checked: value === "admin",
										onChange: () => setValue("admin"),
									},
								},
							]}
						/>
					</form>
				</inviteMembersModal.Component>
			</div>
			<div>
				<Table
					fixed
					data={[[name, email, <StatusBadge key="status" status="admin" />]]}
					headers={[
						<div key="user" className={classes.tableHeader}>
							Utilisateur{" "}
							<Button
								iconId="fr-icon-settings-5-line"
								priority="tertiary"
								title=""
							/>
						</div>,
						<div key="user" className={classes.tableHeader}>
							Mail{" "}
							<Button
								iconId="fr-icon-settings-5-line"
								priority="tertiary"
								title=""
							/>
						</div>,
						<div key="user" className={classes.tableHeader}>
							Statut{" "}
							<Button
								iconId="fr-icon-settings-5-line"
								priority="tertiary"
								title=""
							/>
						</div>,
					]}
				/>
			</div>
		</section>
	);
}

const useStyles = tss.withName(Membres.name).create({
	adminBadge: {
		backgroundColor:
			fr.colors.decisions.background.contrast.purpleGlycine.default,
		color: fr.colors.decisions.text.label.purpleGlycine.default,
	},
	readerBadge: {
		backgroundColor: fr.colors.decisions.background.contrast.info.default,
		color: fr.colors.decisions.text.default.info.default,
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		gap: fr.spacing("4v"),
	},
	button: {
		fontSize: "1rem",
		lineHeight: "1.5rem",
		fontFamily: "Marianne",
		fontWeight: 500,
	},
	modal: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
		alignItems: "flex-end",
	},
	modalHeading: {
		color: fr.colors.decisions.text.title.grey.default,
		fontFamily: "Marianne",
		fontSize: "1.5rem",
		fontStyle: "normal",
		fontWeight: 700,
		lineHeight: "2rem",
		marginBottom: 0,
	},
	modalSubheading: {
		color: fr.colors.decisions.text.mention.grey.default,
		fontFamily: "Marianne",
		fontSize: "0.75rem",
		fontStyle: "normal",
		fontWeight: 400,
		lineHeight: fr.spacing("5v"),
	},
	tableHeader: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
	},
});

import { useState } from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

import type { Declaration } from "payload/payload-types";

const inviteMembersModal = createModal({
	id: "inviteMembersModal",
	isOpenedByDefault: false,
});

interface MembresProps {
	declaration: Declaration | null;
}

export default function Membres({ declaration }: MembresProps) {
	console.log("declaration in Membres:", declaration);
	const [value, setValue] = useState<"reader" | "admin">("reader");

	const StatusBadge = ({ status }: { status: string }) => {
		switch (status) {
			case "admin":
				return (
					<Badge
						key="status"
						style={{
							backgroundColor: "#fee7fc",
							color: "#6E445A",
						}}
					>
						Administrateur
					</Badge>
				);
			case "reader":
				return (
					<Badge
						key="status"
						style={{
							backgroundColor: "#E8EDFF",
							color: "#0063CB",
						}}
					>
						Lecteur
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
						<Badge
							key="status"
							style={{
								backgroundColor: "#e7f3fe",
								color: "#2a5d9f",
							}}
						>
							Lecteur
						</Badge>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								gap: "1rem",
							}}
						>
							<Button
								size="small"
								priority="tertiary"
								style={{
									fontSize: "14px",
									lineHeight: "24px",
									fontFamily: "Marianne",
									fontWeight: "500",
								}}
							>
								Retirer l’accès
							</Button>
							<Button
								size="small"
								priority="tertiary"
								style={{
									fontSize: "14px",
									lineHeight: "24px",
									fontFamily: "Marianne",
									fontWeight: "500",
								}}
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
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					alignItems: "flex-end",
				}}
			>
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
							<h1
								style={{
									// color: "#161616",
									fontFamily: "Marianne",
									fontSize: "24px",
									fontStyle: "normal",
									fontWeight: "700",
									lineHeight: "32px",
									marginBottom: "0px",
								}}
							>
								Inviter un membre
							</h1>
							<p
								style={{
									color: "#929292",
									fontFamily: "Marianne",
									fontSize: "12px",
									fontStyle: "normal",
									fontWeight: "400",
									lineHeight: "20px",
								}}
							>
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
			<div style={{}}>
				<Table
					fixed
					data={[
						[
							declaration.created_by?.name,
							declaration.created_by?.email,
							<StatusBadge key="status" status="admin" />,
						],
					]}
					headers={[
						<div
							key="user"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
							}}
						>
							Utilisateur{" "}
							<Button
								iconId="fr-icon-settings-5-line"
								priority="tertiary"
								title=""
							/>
						</div>,
						<div
							key="user"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
							}}
						>
							Mail{" "}
							<Button
								iconId="fr-icon-settings-5-line"
								priority="tertiary"
								title=""
							/>
						</div>,
						<div
							key="user"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "1rem",
							}}
						>
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

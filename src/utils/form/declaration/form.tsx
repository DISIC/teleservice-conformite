import Internet from "@codegouvfr/react-dsfr/picto/Internet";
import Accessibility from "@codegouvfr/react-dsfr/picto/Accessibility";
import System from "@codegouvfr/react-dsfr/picto/System";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";

import { appKindOptions } from "~/payload/collections/Declaration";
import { kindOptions } from "~/payload/collections/Entity";
import { withForm } from "../context";
import { declarationMultiStepFormOptions } from "./schema";
import PopupMessage from "~/components/declaration/PopupMessage";

export const DeclarationGeneralForm = withForm({
	...declarationMultiStepFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<div>
				<form.AppField name="general.organisation">
					{(field) => (
						<field.TextField
							label="Organisation"
							readOnly={readOnly}
							inputReadOnly
						/>
					)}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.RadioField
							label="Type de service"
							options={[...appKindOptions]}
							readOnly={readOnly}
						/>
					)}
				</form.AppField>
				<form.AppField name="general.name">
					{(field) => (
						<field.TextField
							label="Nom de la déclaration"
							readOnly={readOnly}
							description={
								<>
									Nous vous conseillons d’utiliser le nom du service numérique.
									<br />
									Exemples : Demande de logement social, Service public.fr,
									Outil de gestion des congés
								</>
							}
						/>
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.general?.kind}>
					{(kind) =>
						kind === "website" ? (
							<form.AppField name="general.url">
								{(field) => (
									<field.TextField
										label="URL du service (facultatif)"
										kind="url"
										description={
											<>
												Pour un site web public, renseignez l’adresse accessible
												par les usagers.
												<br />
												Format attendu : https://www.monservice.gouv.fr
											</>
										}
										readOnly={readOnly}
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.AppField name="general.domain">
					{(field) => (
						<field.SelectField
							label="Secteur d’activité de l’organisation"
							placeholder="Sélectionnez un secteur"
							infoStateMessage="Si vous représentez une agglomération, choisissez “Aucun de ces domaines”"
							readOnly={readOnly}
							options={[...kindOptions]}
						/>
					)}
				</form.AppField>
			</div>
		);
	},
});

export const InitialDeclarationForm = withForm({
	...declarationMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
				<form.AppField name="initialDeclaration.newDeclaration">
					{(field) => (
						<field.SelectCardField
							label="Quelle est votre situation pour ce service ?"
							options={[
								{
									id: "viaUrl",
									label:
										"J'ai une déclaration en ligne, sans avoir utilisé Ara",
									description:
										"La nouvelle déclaration pourra être pré-remplie grâce à une IA souveraine; des erreurs peuvent survenir",
									image: <Internet fontSize="3rem" />,
								},
								{
									id: "viaAra",
									label:
										"J'ai généré une déclaration d'accessibilité avec l’outil Ara",
									description:
										"La nouvelle déclaration pourra être pré-remplie automatiquement",
									image: <System fontSize="3rem" />,
								},
								{
									id: "new",
									label: "Je n’ai pas de déclaration d’accessibilité",
									description:
										"La nouvelle déclaration sera à créer manuellement",
									image: <DocumentSearch fontSize="3rem" />,
								},
							]}
						/>
					)}
				</form.AppField>
				<form.Subscribe
					selector={(store) => store.values.initialDeclaration?.newDeclaration}
				>
					{(newDeclaration) => (
						<>
							{newDeclaration === "viaUrl" && (
								<form.AppField name="initialDeclaration.declarationUrl">
									{(field) => (
										<field.TextField
											label="Lien URL de la déclaration en ligne "
											kind="url"
											description="Format attendu : https://www.example.fr"
										/>
									)}
								</form.AppField>
							)}
							{newDeclaration === "viaAra" && (
								<form.AppField name="initialDeclaration.araUrl">
									{(field) => (
										<field.TextField
											label="URL de l’audit Ara"
											kind="url"
											description="Format attendu : https://ara.numerique.gouv.fr/declaration/xxxxxxx"
										/>
									)}
								</form.AppField>
							)}
							{newDeclaration === "" && (
								<PopupMessage
									image={<Accessibility fontSize="6rem" />}
									message="Ara est un outil destiné aux auditeurs qui permet de réaliser un rapport d’audit complet et de générer automatiquement une déclaration d’accessibilité. "
								/>
							)}
						</>
					)}
				</form.Subscribe>
			</div>
		);
	},
});

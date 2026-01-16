import Innovation from "@codegouvfr/react-dsfr/picto/Innovation";

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
			<div>
				<form.AppField name="initialDeclaration.isNewDeclaration">
					{(field) => (
						<field.RadioField
							label="Avez-vous déjà publié une déclaration d’accessibilité sur votre service ?"
							description="Une déclaration d’accessibilité est une page publique qui informe les usagers du niveau de conformité de votre service, liste les contenus non accessibles et indique comment demander une alternative ou signaler un problème."
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
					)}
				</form.AppField>
				<form.Subscribe
					selector={(store) =>
						store.values.initialDeclaration?.isNewDeclaration
					}
				>
					{(isNew) =>
						isNew ? (
							<>
								<form.AppField name="initialDeclaration.publishedDate">
									{(field) => (
										<field.TextField
											label="À quelle date ?"
											description="Format attendu : JJ/MM/AAAA"
											kind="date"
											max={new Date().toISOString().split("T")[0]}
										/>
									)}
								</form.AppField>
								<PopupMessage
									message={
										<>
											<strong>
												Votre auditeur a utilisé Ara pour faire l’audit de cette
												déclaration ?
											</strong>
											<br /> Importez automatiquement l’intégralité des
											informations de votre déclaration en une seule fois en
											renseignant le lien Ara associé !
										</>
									}
									image={<Innovation fontSize="6rem" />}
								/>
								<form.AppField name="initialDeclaration.araUrl">
									{(field) => (
										<field.TextField
											label="Lien URL de la déclaration Ara (facultatif)"
											description="Format attendu : https://www.example.fr."
										/>
									)}
								</form.AppField>
							</>
						) : null
					}
				</form.Subscribe>
			</div>
		);
	},
});

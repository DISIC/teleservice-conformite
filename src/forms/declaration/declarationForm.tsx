import { Part } from "~/components/form/Part";
import {
	appKindOptions,
	kindOptions,
	mobilePlatformOptions,
} from "~/payload/selectOptions";
import { withForm } from "../context";
import { declarationGeneralFormOptions } from "./declarationSchema";

export const DeclarationGeneralForm = withForm({
	...declarationGeneralFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<Part readOnly={readOnly} title="Service numérique concerné">
				<form.AppField name="general.name">
					{(field) => (
						<field.TextField
							label="Nom du service numérique concerné"
							readOnlyField={readOnly}
							hintText={
								<>
									Nous vous conseillons d’utiliser le nom du service numérique.
									<br />
									Exemples : Demande de logement social, Service public.fr,
									Outil de gestion des congés
								</>
							}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.RichRadioField
							label="Type de service"
							readOnlyField={readOnly}
							options={appKindOptions.map(
								({ pictogram: Pictogram, ...option }) => ({
									...option,
									illustration: <Pictogram fontSize="3rem" />,
								}),
							)}
							onOptionChange={() => {
								form.setFieldValue("general.url", "");
								form.setFieldValue("general.mobilePlatform", undefined);
							}}
							required
						/>
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.general?.kind}>
					{(kind) => {
						switch (kind) {
							case "mobile_app":
								return (
									<form.AppField name="general.mobilePlatform">
										{(field) => (
											<field.SelectField
												label="Plateforme mobile"
												placeholder="Sélectionnez une plateforme"
												readOnlyField={readOnly}
												options={[...mobilePlatformOptions]}
												required
											/>
										)}
									</form.AppField>
								);
							case "website":
								return (
									<form.AppField name="general.url">
										{(field) => (
											<field.TextField
												label="URL de la page d’accueil du site audité"
												nativeInputProps={{ type: "url " }}
												hintText={
													<>
														Pour un site web public, renseignez l’adresse
														accessible par les usagers.
														<br />
														Format attendu : https://www.monservice.gouv.fr
													</>
												}
												readOnlyField={readOnly}
												required
											/>
										)}
									</form.AppField>
								);
							default:
								return null;
						}
					}}
				</form.Subscribe>
				<form.AppField name="general.domain">
					{(field) => (
						<field.SelectField
							label="Secteur d’activité du service concerné"
							placeholder="Sélectionnez un secteur"
							hint="Cette donnée sera utilisée à des fins de statistiques."
							infoStateMessage="Si vous représentez une agglomération, choisissez “Aucun de ces domaines”"
							readOnlyField={readOnly}
							options={[...kindOptions]}
							required
						/>
					)}
				</form.AppField>
			</Part>
		);
	},
});

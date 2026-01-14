import PopupMessage from "~/components/declaration/PopupMessage";
import { withForm } from "../context";
import { schemaFormOptions } from "./schema";
import Information from "@codegouvfr/react-dsfr/picto/Information";

export const SchemaForm = withForm({
	...schemaFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="hasDoneCurrentYearSchema">
					{(field) => (
						<>
							<field.RadioField
								label="Avez-vous réalisé un schéma annuel pour l’année en cours ?"
								description="Le schéma annuel, ou plan d’action, détaille les actions prévues sur l’année pour améliorer l’accessibilité de vos services numériques."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
							/>
							{field.state.value ? (
								<form.AppField name="currentYearSchemaUrl">
									{(field) => (
										<field.TextField
											kind="url"
											label="Lien URL du schéma annuel à jour"
											description={
												<>
													Si vous êtes en cours de création de ce schéma,
													laissez le champ vide et revenez modifier votre
													déclaration une fois le schéma terminé. <br /> Format
													attendu : https://www.example.fr
												</>
											}
										/>
									)}
								</form.AppField>
							) : (
								<PopupMessage
									image={<Information fontSize="6rem" />}
									message={
										<>
											Nous vous rappelons que la réalisation d’un schéma annuel
											est obligatoire.
											<br /> Pour réaliser un schéma annuel, .....
										</>
									}
								/>
							)}
						</>
					)}
				</form.AppField>
				<form.AppField name="hasDonePreviousYearsSchema">
					{(field) => (
						<>
							<field.RadioField
								label="Avez-vous réalisé un schéma annuel pour les années précédentes ?"
								description="Le bilan des actions liste les actions réalisées pendant les années précédentes pour améliorer l’accessibilité de vos services numériques."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
							/>
							{field.state.value && (
								<form.AppField name="previousYearsSchemaUrl">
									{(field) => (
										<field.TextField
											kind="url"
											label="Lien URL du bilan des actions"
											description="Format attendu : https://www.example.fr"
										/>
									)}
								</form.AppField>
							)}
						</>
					)}
				</form.AppField>
			</>
		);
	},
});

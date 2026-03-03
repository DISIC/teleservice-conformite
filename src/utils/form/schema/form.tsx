import Information from "@codegouvfr/react-dsfr/picto/Information";
import HelpingMessage from "~/components/declaration/HelpingMessage";
import { withForm } from "../context";
import { schemaFormOptions } from "./schema";

export const SchemaForm = withForm({
	...schemaFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="hasDoneCurrentYearSchema">
					{(field) => (
						<>
							<field.RadioField
								legend="Avez-vous réalisé un plan d’action pour l’année en cours ?"
								hintText="Le plan d’action, ou schéma annuel, détaille les actions prévues sur l’année pour améliorer l’accessibilité de vos services numériques."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
								required
							/>
							{field.state.value ? (
								<form.AppField name="currentYearSchemaUrl">
									{(field) => (
										<field.TextField
											label="Lien URL du schéma annuel à jour"
											hintText={
												<>
													Si vous êtes en cours de création de ce schéma,
													laissez le champ vide et revenez modifier votre
													déclaration une fois le schéma terminé. <br /> Format
													attendu : https://www.example.fr
												</>
											}
											nativeInputProps={{ type: "url" }}
											required
										/>
									)}
								</form.AppField>
							) : (
								<HelpingMessage
									image={<Information fontSize="6rem" />}
									message={
										<>
											L’objectif d’un plan d’action est de créer une démarche
											d’amélioration continue de l’accessibilité. Sa création
											est obligatoire.
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
								legend="Avez-vous réalisé un bilan des actions des années précédentes ?"
								hintText="Le bilan des actions liste les actions réalisées pendant les années précédentes pour améliorer l’accessibilité de vos services numériques."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
								required
							/>
							{field.state.value && (
								<form.AppField name="previousYearsSchemaUrl">
									{(field) => (
										<field.TextField
											label="Lien URL du bilan des actions"
											hintText="Format attendu : https://www.example.fr"
											nativeInputProps={{ type: "url" }}
											required
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

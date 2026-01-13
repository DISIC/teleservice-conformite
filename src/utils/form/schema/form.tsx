import { withForm } from "../context";
import { schemaFormOptions } from "./schema";

export const SchemaForm = withForm({
	...schemaFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="schemaDone">
				{(field) => (
					<field.RadioField
						label="Avez-vous réalisé un schéma pluriannuel de mise en accessibilité entre £2023 et £2025 ?"
						description="Le schéma pluriannuel est le plan d’action de votre organisme en matière d’accessibilité numérique. Il présente les objectifs, priorités et échéances prévues sur plusieurs années. Si vous êtes en cours de création de ce schéma, renseignez “non” puis venez modifiez votre déclaration une fois le schéma terminé."
						options={[
							{ label: "Oui", value: true },
							{ label: "Non", value: false },
						]}
					/>
				)}
			</form.AppField>
		);
	},
});

export const CurrentYearSchemaLinksForm = withForm({
	...schemaFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="currentYearSchemaDone">
				{(field) => (
					<>
						<field.RadioField
							label="Avez-vous réalisé un schéma annuel pour l’année en cours ?"
							description="Le schéma annuel, ou plan d’action, détaille les actions prévues sur l’année pour améliorer l’accessibilité de vos services numériques. Si vous êtes en cours de création de ce schéma, renseignez “non” puis venez modifiez votre déclaration une fois le schéma terminé."
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
						{field.state.value && (
							<>
								<form.AppField name="annualSchemaLink">
									{(field) => (
										<field.TextField
											label="Lien URL du schéma annuel"
											description="Format attendu : https://www.example.fr"
										/>
									)}
								</form.AppField>
								<form.AppField name="annualSchemaFile">
									{(field) => (
										<field.TextField
											label="Fichier du schéma annuel"
											kind="url"
										/>
									)}
								</form.AppField>
							</>
						)}
					</>
				)}
			</form.AppField>
		);
	},
});

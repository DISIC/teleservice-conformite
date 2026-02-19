import { withForm } from "../context";
import { contactFormOptions } from "./schema";

export const ContactTypeForm = withForm({
	...contactFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="contactType">
					{(field) => (
						<field.CheckboxGroupField
							label="Manière de contacter la personne responsable de l’accessibilité"
							description="Vous pouvez sélectionner plusieurs choix."
							options={[
								{ label: "Formulaire en ligne", value: "onlineForm" },
								{ label: "Point de contact", value: "contactPoint" },
							]}
							required
						/>
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values?.contactType}>
					{(contactType) =>
						contactType?.includes("onlineForm") && (
							<form.AppField name="contactLink">
								{(field) => (
									<field.TextField
										kind="url"
										label="Lien URL du formulaire"
										description="Format attendu : https://www.example.fr"
										required
									/>
								)}
							</form.AppField>
						)
					}
				</form.Subscribe>
				<form.Subscribe selector={(store) => store.values?.contactType}>
					{(contactType) =>
						contactType?.includes("contactPoint") && (
							<form.AppField name="emailContact">
								{(field) => (
									<field.TextField
										kind="email"
										label="Email de contact"
										description="Indiquez de préférence une adresse de type “contact@monservice.com” plutôt qu’une adresse personnelle"
										required
									/>
								)}
							</form.AppField>
						)
					}
				</form.Subscribe>
			</>
		);
	},
});

import { withForm } from "../context";
import { contactFormOptions } from "./schema";

const defaultValues = contactFormOptions.defaultValues;

export const ContactTypeForm = withForm({
	...contactFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField
					name="contactType"
					listeners={{
						onChange: ({ value }) => {
							if (!value.includes("onlineForm")) {
								form.setFieldValue("url", defaultValues.url);
							}
							if (!value.includes("contactPoint")) {
								form.setFieldValue("email", defaultValues.email);
							}
						},
					}}
				>
					{(field) => (
						<field.CheckboxGroupField
							legend={
								readOnly
									? "Moyen de contact"
									: "Manière de contacter la personne responsable de l’accessibilité"
							}
							hintText="Vous pouvez sélectionner plusieurs choix."
							options={[
								{ label: "Formulaire en ligne", value: "onlineForm" },
								{ label: "Point de contact", value: "contactPoint" },
							]}
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.contactType}>
					{(contactType) =>
						contactType.includes("onlineForm") && (
							<form.AppField name="url">
								{(field) => (
									<field.TextField
										label="Lien URL du formulaire"
										hintText="Format attendu : https://www.example.fr"
										nativeInputProps={{ type: "url" }}
										readOnlyField={readOnly}
										required
									/>
								)}
							</form.AppField>
						)
					}
				</form.Subscribe>
				<form.Subscribe selector={(store) => store.values.contactType}>
					{(contactType) =>
						contactType.includes("contactPoint") && (
							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label={readOnly ? "E-mail" : "Email de contact"}
										hintText="Indiquez de préférence une adresse de type “contact@monservice.com” plutôt qu’une adresse personnelle"
										nativeInputProps={{ type: "email" }}
										readOnlyField={readOnly}
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

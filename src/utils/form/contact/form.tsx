import { withForm } from "../context";
import { contactFormOptions } from "./schema";

export const ContactTypeForm = withForm({
	...contactFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							label="Nom du contact"
							hintText="Ce nom vous aidera à retrouver ce contact (ex: « Référent accessibilité - DSI »)"
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="email">
					{(field) => (
						<field.TextField
							label="Email de contact"
							hintText="Indiquez de préférence une adresse de type « contact@monservice.com » plutôt qu'une adresse personnelle"
							nativeInputProps={{ type: "email" }}
							readOnlyField={readOnly}
						/>
					)}
				</form.AppField>
				<form.AppField name="url">
					{(field) => (
						<field.TextField
							label="Lien URL du formulaire"
							hintText="Format attendu : https://www.example.fr"
							nativeInputProps={{ type: "url" }}
							readOnlyField={readOnly}
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

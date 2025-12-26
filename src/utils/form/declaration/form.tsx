import { withForm } from "../context";
import { declarationMultiStepFormOptions } from "./schema";

export const InitialDeclarationForm = withForm({
	...declarationMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<div>
				<form.AppField name="initialDeclaration.isNewDeclaration">
					{(field) => (
						<field.RadioField
							label="Une déclaration d’accessibilité a-t--elle déjà été publiée sur votre service ?"
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
							<form.AppField name="initialDeclaration.publishedDate">
								{(field) => (
									<field.TextField
										label="À quelle date ?"
										description="Format attendu : JJ/MM/AAAA"
										kind="date"
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.Subscribe
					selector={(store) =>
						store.values.initialDeclaration?.isNewDeclaration
					}
				>
					{(isNew) =>
						isNew ? (
							<form.AppField name="initialDeclaration.usedAra">
								{(field) => (
									<field.RadioField
										label="Votre auditeur a t-il utilisé l’outil Ara ?"
										description="Ara est un outil destiné aux auditeurs formés à l’accessibilité. Il permet de réaliser un audit complet et de générer automatiquement une déclaration d’accessibilité."
										options={[
											{ label: "Oui", value: true },
											{ label: "Non", value: false },
										]}
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.Subscribe
					selector={(store) => store.values.initialDeclaration?.usedAra}
				>
					{(usedAra) =>
						usedAra ? (
							<form.AppField name="initialDeclaration.araUrl">
								{(field) => (
									<field.TextField
										label="Lien URL de la déclaration Ara"
										description="Format attendu : https://www.example.fr. Vous pouvez trouver le lien à TEL ENDROIT sur votre interface Ara"
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
			</div>
		);
	},
});

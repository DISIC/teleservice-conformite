import { fr } from "@codegouvfr/react-dsfr";
import Accessibility from "@codegouvfr/react-dsfr/picto/Accessibility";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Internet from "@codegouvfr/react-dsfr/picto/Internet";
import System from "@codegouvfr/react-dsfr/picto/System";
import { useEffect, useRef, useState } from "react";
import { tss } from "tss-react";

import HelpingMessage from "~/components/declaration/HelpingMessage";
import { appKindOptions, kindOptions } from "~/payload/selectOptions";
import { withForm } from "../context";
import {
	type ZInitialDeclaration,
	declarationMultiStepFormOptions,
} from "./schema";

type DeclarationKind =
	ZInitialDeclaration["initialDeclaration"]["newDeclarationKind"];

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
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.RadioField
							legend="Type de service"
							options={[...appKindOptions]}
							readOnlyField={readOnly}
							onOptionChange={() => form.setFieldValue("general.url", "")}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="general.name">
					{(field) => (
						<field.TextField
							label="Nom de la déclaration"
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
				<form.Subscribe selector={(store) => store.values.general?.kind}>
					{(kind) =>
						kind === "website" ? (
							<form.AppField name="general.url">
								{(field) => (
									<field.TextField
										label="URL du service (facultatif)"
										nativeInputProps={{ type: "url " }}
										hintText={
											<>
												Pour un site web public, renseignez l’adresse accessible
												par les usagers.
												<br />
												Format attendu : https://www.monservice.gouv.fr
											</>
										}
										readOnlyField={readOnly}
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
							readOnlyField={readOnly}
							options={[...kindOptions]}
							required
						/>
					)}
				</form.AppField>
			</div>
		);
	},
});

export const ContextForm = withForm({
	...declarationMultiStepFormOptions,
	render: function Render({ form }) {
		const { classes } = useStyles();
		const [newDeclarationKind, setNewDeclarationKind] =
			useState<DeclarationKind>(undefined);

		return (
			<div className={classes.contextFormContainer}>
				<form.AppField name="initialDeclaration.newDeclarationKind">
					{(field) => (
						<field.SelectCardField
							label="Quelle est votre situation pour ce service ?"
							required
							options={[
								{
									value: "fromUrl",
									label:
										"J'ai une déclaration en ligne, sans avoir utilisé Ara",
									description:
										"La nouvelle déclaration pourra être pré-remplie grâce à une IA souveraine; des erreurs peuvent survenir",
									image: <Internet fontSize="3rem" />,
								},
								{
									value: "fromAra",
									label:
										"J'ai une déclaration en ligne réalisée avec l’outil Ara",
									description:
										"La nouvelle déclaration pourra être pré-remplie automatiquement",
									image: <System fontSize="3rem" />,
								},
								{
									value: "fromScratch",
									label: "Je n’ai pas de déclaration d’accessibilité",
									description:
										"La nouvelle déclaration sera à créer manuellement",
									image: <DocumentSearch fontSize="3rem" />,
								},
							]}
							onOptionChange={(value) => {
								form.resetField("initialDeclaration.declarationUrl");
								form.resetField("initialDeclaration.araUrl");
								setNewDeclarationKind(value as DeclarationKind);
							}}
						/>
					)}
				</form.AppField>
				{newDeclarationKind !== "fromScratch" && (
					<form.Subscribe
						selector={(store) =>
							store.values.initialDeclaration?.newDeclarationKind
						}
					>
						{(newDeclarationKind) => (
							<div>
								{newDeclarationKind === "fromUrl" && (
									<form.AppField name="initialDeclaration.declarationUrl">
										{(field) => (
											<field.TextField
												label="Lien URL de la déclaration en ligne "
												nativeInputProps={{ type: "url" }}
												hintText="Format attendu : https://www.example.fr"
												required
											/>
										)}
									</form.AppField>
								)}
								{newDeclarationKind === "fromAra" && (
									<form.AppField name="initialDeclaration.araUrl">
										{(field) => (
											<field.TextField
												label="URL de l’audit Ara"
												nativeInputProps={{ type: "url" }}
												hintText="Format attendu : https://ara.numerique.gouv.fr/declaration/xxxxxxx"
												required
											/>
										)}
									</form.AppField>
								)}
								{!newDeclarationKind && (
									<HelpingMessage
										image={<Accessibility fontSize="6rem" />}
										message={
											<span>
												<a
													href="https://ara.numerique.gouv.fr/"
													className={fr.cx("fr-link")}
													target="_blank"
													rel="noreferrer"
													title="Ara, nouvelle fenêtre"
												>
													Ara
												</a>{" "}
												est un outil destiné aux auditeurs qui permet de
												réaliser un rapport d’audit complet et de générer
												automatiquement une déclaration d’accessibilité.
											</span>
										}
									/>
								)}
							</div>
						)}
					</form.Subscribe>
				)}
			</div>
		);
	},
});

const useStyles = tss.withName(ContextForm.name).create({
	contextFormContainer: {
		display: "flex",
		flexDirection: "column",
		gap: "2rem",
	},
});

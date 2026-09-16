import Calendar from "@codegouvfr/react-dsfr/picto/Calendar";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Error from "@codegouvfr/react-dsfr/picto/Error";
import type { ComponentProps } from "react";
import { SchemaForm as DeclarationSchemaForm } from "~/forms/schema/schemaForm";
import {
	declarationToSchemaValues,
	schemaForm,
	type ZSchema,
} from "~/forms/schema/schemaSchema";
import { api } from "~/lib/api";
import { defineSection, type SourceModeOption } from "../defineSection";

type SchemaFormApi = ComponentProps<typeof DeclarationSchemaForm>["form"];

const SCHEMA_OPTIONS: SourceModeOption[] = [
	{
		value: "linked",
		label: "Utiliser un schéma de ma bibliothèque",
		hintText: "Réutilise un schéma enregistré, mis à jour automatiquement.",
		illustration: <DocumentSearch fontSize="3rem" />,
	},
	{
		value: "custom",
		label: "Définir un schéma pour cette déclaration",
		hintText: "Renseignez un schéma propre à cette déclaration.",
		illustration: <Calendar fontSize="3rem" />,
	},
	{
		value: "skipped",
		label: "Aucun schéma pour le moment",
		hintText:
			"Vous pourrez en ajouter un plus tard sans bloquer la publication.",
		illustration: <Error fontSize="3rem" />,
	},
];

export const schemaSection = defineSection<ZSchema, SchemaFormApi>({
	slug: "schema",
	schema: schemaForm,
	toValues: declarationToSchemaValues,
	useSave: (declaration, options) => {
		const { mutateAsync, isPending } = api.schema.upsert.useMutation(options);
		return {
			save: (values) => mutateAsync({ declarationId: declaration.id, values }),
			isPending,
		};
	},
	renderForm: ({ form, readOnly }) => (
		<DeclarationSchemaForm form={form} readOnly={readOnly} />
	),
	library: {
		kind: "schema",
		legend: "Renseigner un schéma pluriannuel :",
		options: SCHEMA_OPTIONS,
	},
});

import Calendar from "@codegouvfr/react-dsfr/picto/Calendar";
import Error from "@codegouvfr/react-dsfr/picto/Error";
import type { ComponentProps } from "react";
import DocumentCalendar from "~/components/ui/picto/DocumentCalendar";
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
		label: "Utiliser un schéma pluriannuel existant",
		hintText: "Enregistré dans vos documents.",
		illustration: <DocumentCalendar fontSize="3rem" viewBox="0 0 56 56" />,
	},
	{
		value: "custom",
		label: "Définir un schéma pluriannuel",
		illustration: <Calendar fontSize="3rem" />,
	},
	{
		value: "skipped",
		label: "Renseigner un schéma pluriannuel plus tard",
		hintText:
			"Vous pouvez publier votre déclaration et renseigner votre schéma pluriannuel par la suite.",
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

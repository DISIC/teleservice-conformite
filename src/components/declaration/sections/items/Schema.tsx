import type { ComponentProps } from "react";
import { api } from "~/lib/api";
import { SchemaForm as DeclarationSchemaForm } from "~/forms/schema/schemaForm";
import {
	declarationToSchemaValues,
	schemaForm,
	type ZSchema,
} from "~/forms/schema/schemaSchema";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { applyLibrarySection } from "~/utils/declaration/sourceMode";
import { logMutationError } from "~/utils/declaration-helper";
import type { SectionRenderProps } from "../Content";
import { SourceModeSection, type SourceModeOption } from "../SourceModeSection";
import Calendar from "@codegouvfr/react-dsfr/picto/Calendar";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Error from "@codegouvfr/react-dsfr/picto/Error";

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

export function SchemaSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
}: SectionRenderProps) {
	const { mutateAsync: upsertSchema, isPending } =
		api.schema.upsert.useMutation({
			onError: logMutationError("upserting schema", declaration.id),
		});
	const applySchema = applyLibrarySection("schema", onDeclarationChange);

	return (
		<SourceModeSection<ZSchema, SchemaFormApi>
			kind="schema"
			title={SECTION_TITLES.schema}
			declaration={declaration}
			onDeclarationChange={onDeclarationChange}
			mode={mode}
			prevHref={prevHref}
			nextHref={nextHref}
			schema={schemaForm}
			toValues={declarationToSchemaValues}
			commit={async (values) =>
				applySchema(
					await upsertSchema({ values, declarationId: declaration.id }),
				)
			}
			isSaving={isPending}
			options={SCHEMA_OPTIONS}
			renderForm={({ form, readOnly }) => (
				<DeclarationSchemaForm form={form} readOnly={readOnly} />
			)}
		/>
	);
}

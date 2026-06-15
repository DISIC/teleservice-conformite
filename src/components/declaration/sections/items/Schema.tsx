import type { ComponentProps } from "react";
import { api } from "~/lib/api";
import { SchemaForm as DeclarationSchemaForm } from "~/forms/schema/schemaForm";
import {
	declarationToSchemaValues,
	schemaFormOptions,
	type ZSchema,
} from "~/forms/schema/schemaSchema";
import { SECTION_TITLES } from "~/utils/declaration/sections";
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
		illustration: <DocumentSearch />,
	},
	{
		value: "custom",
		label: "Définir un schéma pour cette déclaration",
		hintText: "Renseignez un schéma propre à cette déclaration.",
		illustration: <Calendar />,
	},
	{
		value: "skipped",
		label: "Aucun schéma pour le moment",
		hintText:
			"Vous pourrez en ajouter un plus tard sans bloquer la publication.",
		illustration: <Error />,
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

	return (
		<SourceModeSection<ZSchema, SchemaFormApi>
			kind="schema"
			title={SECTION_TITLES.schema}
			declaration={declaration}
			onDeclarationChange={onDeclarationChange}
			mode={mode}
			prevHref={prevHref}
			nextHref={nextHref}
			formOptions={schemaFormOptions}
			toValues={declarationToSchemaValues}
			commit={async (values) => {
				const { data: schema, status } = await upsertSchema({
					values,
					declarationId: declaration.id,
				});
				onDeclarationChange((prev) => ({
					...prev,
					schema,
					status: status ?? prev.status,
				}));
				return { schema };
			}}
			isSaving={isPending}
			options={SCHEMA_OPTIONS}
			renderForm={({ form, readOnly }) => (
				<DeclarationSchemaForm form={form} readOnly={readOnly} />
			)}
		/>
	);
}

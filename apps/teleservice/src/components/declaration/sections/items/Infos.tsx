import type { ComponentProps } from "react";
import { DeclarationGeneralForm } from "~/forms/declaration/declarationForm";
import {
	declarationGeneralRefined,
	declarationToGeneralValues,
	type ZDeclarationGeneral,
} from "~/forms/declaration/declarationSchema";
import { isValidDate } from "~/forms/rules";
import { api } from "~/lib/api";
import { defineSection } from "../defineSection";

type InfosFormApi = ComponentProps<typeof DeclarationGeneralForm>["form"];

export const infosSection = defineSection<ZDeclarationGeneral, InfosFormApi>({
	slug: "infos",
	schema: declarationGeneralRefined,
	toValues: declarationToGeneralValues,
	useSave: (declaration, options) => {
		const { mutateAsync, isPending } =
			api.declaration.update.useMutation(options);
		return {
			save: (value) =>
				mutateAsync({
					declarationId: declaration.id,
					general: {
						...value.general,
						firstPublishedAt: isValidDate(value.general.firstPublishedAt)
							? value.general.firstPublishedAt
							: "",
					},
				}),
			isPending,
		};
	},
	renderForm: ({ form, readOnly, mode, declaration }) => (
		<DeclarationGeneralForm
			form={form}
			readOnly={readOnly}
			showFirstPublishedAt={
				mode === "sequential" && declaration.fromSource !== "manual"
			}
		/>
	),
});

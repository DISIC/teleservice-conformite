import {
	appKindOptions,
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type PublishedDeclaration = {
	name: string;
	entityName: string;
	schema: {
		schemaName: string;
		schemaUrl: string;
		actionPlanUrls: { url: string }[];
	};
	appKindLabel: string;
	url: string;
	audit: {
		rgaa_version: string | undefined;
		realised_by: string;
		rate: number;
		nonCompliantElements: string | null;
		disproportionnedCharge: string | null;
		optionalElements: string | null;
		compliantElements: string;
		technologies: { name: string }[];
		testEnvironments: string[];
		usedTools: string[];
	};
	contact: {
		url: string | null;
		email: string | null;
	};
};

export const extractDeclarationContentToPublish = (
	declaration: PopulatedDeclaration,
): PublishedDeclaration => {
	return {
		name: declaration.name ?? "",
		entityName: declaration.entity?.name ?? "",
		schema: {
			schemaName: declaration?.schema?.schemaName ?? "",
			schemaUrl: declaration?.schema?.schemaUrl ?? "",
			actionPlanUrls: (declaration?.schema?.actionPlanUrls ?? []).map(
				(item) => ({ url: item.url ?? "" }),
			),
		},
		appKindLabel:
			appKindOptions.find((kind) => kind.value === declaration.app_kind)
				?.label ?? "",
		url: declaration?.url ?? "",
		audit: {
			rgaa_version:
				rgaaVersionOptions.find(
					(option) => option.value === declaration?.audit?.rgaa_version,
				)?.label ?? "RGAA 4",
			realised_by: declaration.audit?.realisedBy ?? "",
			rate: declaration.audit?.rate ?? 0,
			nonCompliantElements: declaration?.audit?.nonCompliantElements ?? "",
			disproportionnedCharge: declaration?.audit?.disproportionnedCharge ?? "",
			optionalElements: declaration?.audit?.optionalElements ?? "",
			compliantElements: declaration?.audit?.compliantElements ?? "",
			technologies: declaration?.audit?.technologies ?? [],
			testEnvironments:
				(declaration?.audit?.testEnvironments ?? [])?.map(
					(env) =>
						testEnvironmentOptions.find((option) => option.value === env.name)
							?.label ?? env.name,
				) ?? [],
			usedTools:
				(declaration?.audit?.usedTools ?? [])?.map(
					(tool) =>
						toolOptions.find((option) => option.value === tool.name)?.label ??
						tool.name,
				) ?? [],
		},
		contact: {
			url: declaration.contact?.url ?? "",
			email: declaration.contact?.email ?? "",
		},
	};
};

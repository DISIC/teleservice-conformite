import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions, type ZSchema } from "~/utils/form/schema/schema";
import { guardDeclaration } from "~/utils/server-guards";

export default function SchemaPage({
	declaration: initialDeclaration,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(!!declaration?.schema);

	const { data: libraryItems = [], refetch: refetchLibrary } =
		api.entityLibrary.listSchemas.useQuery(
			{ entityId: Number(declaration.entity?.id) },
			{ enabled: !!declaration.entity?.id },
		);

	const { mutateAsync: upsertSchema } = api.schema.upsert.useMutation({
		onSuccess: async ({ data: schema }) => {
			refetchLibrary();
			if (!declaration.schema) {
				const isComplete = declaration.audit && declaration.contact;
				router.push(
					`/dashboard/declaration/${declaration.id}${isComplete ? "/preview" : ""}`,
				);
			} else {
				setDeclaration((prev) => ({ ...prev, schema }));
				setReadOnly(true);
			}
		},
		onError: (error) =>
			console.error(
				`Error updating schema for declaration with id ${declaration?.id}:`,
				error,
			),
	});

	const { mutateAsync: linkExisting } = api.schema.linkExisting.useMutation({
		onSuccess: async () => router.reload(),
	});

	const onEditInfos = () => {
		if (!readOnly) form.reset();
		setReadOnly((prev) => !prev);
	};

	const defaultValues: ZSchema = useMemo(() => {
		if (!declaration.schema) return schemaFormOptions.defaultValues;

		return {
			schemaName: declaration.schema.schemaName ?? "",
			schemaUrl: declaration.schema.schemaUrl ?? "",
			actionPlanUrls: (declaration.schema.actionPlanUrls ?? []).map((item) => ({
				name: item.name ?? "",
				url: item.url ?? "",
			})),
		};
	}, [declaration.schema]);

	const form = useAppForm({
		...schemaFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsertSchema({
				values: value,
				id: declaration.schema?.id,
				declarationId: declaration.id,
			});
		},
	});

	return (
		<>
			<Head>
				<title>
					Schéma et plans d'actions - Déclaration de {declaration.name} -
					Téléservice Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Schéma et plans d'actions"
				breadcrumbLabel={declaration?.name ?? ""}
				isEditable={!!declaration?.schema}
				onToggleEdit={onEditInfos}
				readOnly={readOnly}
				isAiGenerated={declaration?.fromSource === "ai"}
			>
				{!readOnly && libraryItems.length > 0 && (
					<EntityLibraryPicker
						label="Utiliser un schéma existant de l'administration"
						placeholder="Sélectionner un schéma"
						items={libraryItems.map((s) => ({
							id: s.id,
							label: s.schemaName,
							hint: s.schemaUrl || "",
						}))}
						selectedId={declaration.schema?.id ?? null}
						onSelect={(id) =>
							linkExisting({ schemaId: id, declarationId: declaration.id })
						}
					/>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={commonClasses.whiteBackground}>
						<DeclarationSchemaForm form={form} readOnly={readOnly} />
					</div>
					<form.AppForm>
						<div className={commonClasses.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								onClick={() =>
									router.push(`/dashboard/declaration/${declaration.id}`)
								}
								priority="tertiary"
								ariaLabel="Retour à la déclaration"
							/>
							{!readOnly && (
								<form.SubscribeButton
									label={
										declaration.schema?.toVerify
											? "Valider les informations"
											: "Valider"
									}
									iconId="fr-icon-check-line"
									iconPosition="right"
								/>
							)}
						</div>
					</form.AppForm>
				</form>
			</DeclarationForm>
		</>
	);
}

export const getServerSideProps = (async (context) =>
	guardDeclaration(context)) satisfies GetServerSideProps<{
	declaration: PopulatedDeclaration;
}>;

import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { useRouter } from "next/router";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { DeclarationGeneralForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { api } from "~/utils/api";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { ReadOnlyDeclarationGeneral } from "~/components/declaration/ReadOnlyDeclaration";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";

export default function GeneralInformationsPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const router = useRouter();
	const { classes } = useStyles();
	const { classes: commonClasses } = useCommonStyles();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const { name, kind } = declaration?.entity || {};
	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

	const { mutateAsync: update } = api.declaration.update.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				...result.data,
			}));
			setEditMode(false);
		},
		onError: async (error) => {
			console.error(
				`Error updating declaration with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const { mutateAsync: updateStatus } =
		api.declaration.updateStatus.useMutation({
			onSuccess: async (result) => {
				setDeclaration((prev) => ({
					...prev,
					status: result.data.status,
				}));

				router.push(declarationPagePath);
			},
			onError: async (error) => {
				console.error(
					`Error updating declaration status with id ${declaration?.id}:`,
					error,
				);
			},
		});

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	if (declaration) {
		readOnlyFormOptions.defaultValues.general = {
			organisation: name ?? "",
			kind: declaration?.app_kind as (typeof readOnlyFormOptions)["defaultValues"]["general"]["kind"],
			name: declaration?.name ?? "",
			url: declaration?.url ?? "",
			domain: kind ?? "",
		};
	}

	const updateDeclaration = async (
		generalValues: typeof readOnlyFormOptions.defaultValues.general,
		declarationId: number,
	) => {
		try {
			await update({
				general: {
					domain: generalValues.domain,
					name: generalValues.name,
					url: generalValues.url,
					kind: generalValues.kind,
					organisation: generalValues.organisation,
					declarationId,
					entityId: declaration?.entity?.id ?? -1,
				},
			});
		} catch (error) {
			console.error(
				`Error updating declaration with id ${declarationId}:`,
				error,
			);
		}
	};

	const updateDeclarationStatus = async () => {
		try {
			await updateStatus({
				status: "unpublished",
				id: declaration?.id ?? -1,
			});
		} catch (error) {
			return;
		}
	};

	const form = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			await updateDeclaration(value.general, declaration?.id ?? -1);
		},
	});

	return (
		<DeclarationForm
			declaration={declaration}
			title="Informations générales"
			breadcrumbLabel={declaration?.name ?? ""}
			showValidateButton={declaration.status === "unverified" && !editMode}
			onValidate={updateDeclarationStatus}
			isEditable={true}
			onToggleEdit={onEditInfos}
			editMode={editMode}
			showLayoutComponent={false}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				{editMode ? (
					<>
						<div className={commonClasses.whiteBackground}>
							<DeclarationGeneralForm form={form} />
						</div>
						<form.AppForm>
							<form.SubscribeButton label={"Valider"} />
						</form.AppForm>
					</>
				) : (
					<div className={commonClasses.whiteBackground}>
						<ReadOnlyDeclarationGeneral declaration={declaration ?? null} />
					</div>
				)}
			</form>
		</DeclarationForm>
	);
}

const useStyles = tss.withName(GeneralInformationsPage.name).create({
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	return {
		props: {
			declaration: declaration,
		},
	};
};

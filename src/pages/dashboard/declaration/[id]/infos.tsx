import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { DeclarationGeneralForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { api } from "~/utils/api";
import { getDeclarationById } from "~/utils/payload-helper";
import type { PopulatedDeclaration } from "~/utils/payload-helper";
import { ReadOnlyDeclarationGeneral } from "~/components/declaration/ReadOnlyDeclaration";

export default function GeneralInformationsPage({
	declaration,
}: { declaration?: PopulatedDeclaration }) {
	const router = useRouter();
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const { name, kind } = declaration?.entity || {};

	const { mutateAsync: update } = api.declaration.update.useMutation({
		onSuccess: async (result) => {
			router.reload();
		},
		onError: async (error) => {
			console.error(
				`Error updating declaration with id ${declaration?.id}:`,
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

	const form = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			await updateDeclaration(value.general, declaration?.id ?? -1);
		},
	});

	return (
		<section id="general-informations" className={classes.main}>
			<div>
				<Breadcrumb
					segments={[
						{ label: "Accueil", linkProps: { href: "/dashboard" } },
						{
							label: declaration?.name ?? "",
							linkProps: { href: `/dashboard/declaration/${declaration?.id}` },
						},
					]}
					currentPageLabel="Informations générales"
				/>
				<div>
					<h1>{declaration?.name ?? ""} - Informations générales</h1>
					<div className={classes.headerAction}>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					</div>
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className={classes.formWrapper}>
						{editMode ? (
							<>
								<DeclarationGeneralForm form={form} />
								<form.AppForm>
									<form.SubscribeButton label={"Valider"} />
								</form.AppForm>
							</>
						) : (
							<ReadOnlyDeclarationGeneral declaration={declaration ?? null} />
						)}
					</div>
				</form>
			</div>
		</section>
	);
}

const useStyles = tss.withName(GeneralInformationsPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: fr.spacing("6w"),
	},
	headerAction: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	description: {
		fontSize: "1rem",
		color: "grey",
	},
	title: {
		fontSize: "1rem",
		color: fr.colors.decisions.text.mention.grey.default,
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

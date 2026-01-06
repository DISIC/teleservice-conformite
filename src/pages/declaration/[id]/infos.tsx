import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";

import type { Declaration } from "~/payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { DeclarationGeneralForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { getPopulated } from "~/utils/payload-helper";
import { api } from "~/utils/api";

export default function GeneralInformationsPage({
	declaration,
}: { declaration?: Declaration }) {
	const router = useRouter();
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const { name, field } = getPopulated(declaration?.entity) || {};

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

	readOnlyFormOptions.defaultValues.general = {
		organisation: name ?? "",
		kind: declaration?.app_kind as (typeof readOnlyFormOptions)["defaultValues"]["general"]["kind"],
		name: declaration?.name ?? "",
		url: declaration?.url ?? "",
		domain: field ?? "",
	};

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
					entityId: getPopulated(declaration?.entity)?.id ?? -1,
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
			<div className={classes.container}>
				<div className={classes.header}>
					<h2 className={classes.title}>
						Verifiez les informations et modifiez-les si necessaire
					</h2>
					<Button priority="secondary" onClick={onEditInfos}>
						{!editMode ? "Modifier" : "Annuler"}
					</Button>
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className={classes.formWrapper}>
						<DeclarationGeneralForm form={form} readOnly={!editMode} />
						{editMode && (
							<form.AppForm>
								<form.SubscribeButton label={"Valider"} />
							</form.AppForm>
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
		gap: fr.spacing("3w"),
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	container: {
		display: "flex",
		flexDirection: "column",
	},
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
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
			redirect: { destination: "/" },
		};
	}

	const payload = await getPayload({ config });

	try {
		const declaration = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		if (!declaration) {
			return {
				props: {},
				redirect: { destination: "/declarations" },
			};
		}

		return {
			props: {
				declaration,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/declarations" },
			props: {},
		};
	}
};

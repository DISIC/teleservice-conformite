import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";

import { useAppForm } from "~/utils/form/context";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";
import {
	DeclarationGeneralForm,
	InitialDeclarationForm,
} from "~/utils/form/declaration/form";
import { api } from "~/utils/api";
import { auth } from "~/utils/auth";
import type { Entity } from "~/payload/payload-types";
import type { kindOptions } from "~/payload/collections/Entity";
import type { appKindOptions } from "~/payload/collections/Declaration";

export default function FormPage({ entity }: { entity: Entity | null }) {
	const { classes } = useStyles();
	const router = useRouter();

	const { mutateAsync: createDeclaration } = api.declaration.create.useMutation(
		{
			onSuccess: async (result) => {
				router.push(`/dashboard/declaration/${result.data}`);
			},
			onError: (error) => {
				console.error("Error adding declaration:", error);
			},
		},
	);

	declarationMultiStepFormOptions.defaultValues.section = "initialDeclaration";

	const addDeclaration = async (generalData: {
		name: string;
		url: string;
		organisation: string;
		kind: (typeof appKindOptions)[number]["value"];
		domain: string;
	}) => {
		try {
			const general = {
				...generalData,
				entityId: entity?.id,
			};

			await createDeclaration({ general });
		} catch (error) {
			console.error("Error adding declaration:", error);
		}
	};

	declarationMultiStepFormOptions.defaultValues.general = {
		...declarationMultiStepFormOptions.defaultValues.general,
		organisation: entity?.name || "",
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "initialDeclaration") {
				formApi.setFieldValue("section", "general");
			} else {
				await addDeclaration(value.general);
			}
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	return (
		<div className={classes.main}>
			<h2>
				{section === "initialDeclaration"
					? "Contexte"
					: "Informations générales"}
			</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					{section === "initialDeclaration" && (
						<InitialDeclarationForm form={form} />
					)}
					{section === "general" && (
						<DeclarationGeneralForm form={form} readOnly={false} />
					)}
					<form.AppForm>
						<div className={classes.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								onClick={() => {
									router.back();
								}}
								priority="tertiary"
							/>
							<form.SubscribeButton
								label="Continuer"
								iconId="fr-icon-arrow-right-line"
								iconPosition="right"
							/>
						</div>
					</form.AppForm>
				</div>
			</form>
		</div>
	);
}

const useStyles = tss.withName(FormPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const payload = await getPayload({ config });
	const authSession = await auth.api.getSession({
		headers: new Headers(context.req.headers as HeadersInit),
	});

	if (!authSession) {
		return { redirect: { destination: "/" }, props: {} };
	}

	try {
		const user = await payload.findByID({
			collection: "users",
			id: authSession?.user?.id,
			depth: 3,
		});

		return {
			props: {
				entity: user?.entity || null,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/dashboard" },
			props: {},
		};
	}
};

import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import config from "@payload-config";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { tss } from "tss-react";
import type {
	ActionPlan,
	Audit,
	Contact,
	Entity,
	User,
} from "~/payload/payload-types";

import Head from "next/head";
import PublishedDeclarationTemplate, {
	extractDeclarationContentToPublish,
	type PublishedDeclaration,
} from "~/components/declaration/PublishedDeclarationTemplate";
import {
	type PopulatedDeclaration,
	getDeclarationById,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { auth } from "~/utils/auth";

type RequiredPopulatedDeclaration = Omit<
	PopulatedDeclaration,
	"audit" | "contact" | "entity" | "actionPlan" | "created_by"
> & {
	audit: Audit;
	contact: Contact;
	entity: Entity;
	actionPlan: ActionPlan;
	created_by: User;
};

export default function DeclarationPreviewPage({
	declaration,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes, cx } = useStyles();
	const router = useRouter();

	const publishedDeclarationContent: PublishedDeclaration =
		extractDeclarationContentToPublish(declaration);

	const { mutateAsync: publishDeclaration } =
		api.declaration.updatePublishedContent.useMutation({
			onSuccess: () => {
				router.push(`/dashboard/declaration/${declaration.id}?published=true`);
			},
			onError: (error) => {
				console.error("Error publishing declaration:", error);
			},
		});

	const onPublish = () => {
		try {
			publishDeclaration({
				id: declaration.id,
				content: JSON.stringify(publishedDeclarationContent),
			});
		} catch (error) {
			return;
		}
	};

	return (
		<>
			<Head>
				<title>
					Votre déclaration est prête à être publiée - Déclaration de{" "}
					{declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<section id="declaration-preview" className={fr.cx("fr-container")}>
				<div className={classes.main}>
					<h1>Votre déclaration est prête à être publiée</h1>
					<p>
						Voici un aperçu de votre déclaration. Publiez-la pour la rendre
						accessible en ligne, puis partagez-la via le bouton ”Publier la
						déclaration”.
					</p>
					<div className={classes.declarationPreview}>
						<PublishedDeclarationTemplate
							declaration={publishedDeclarationContent}
							mode="preview"
						/>
					</div>
					<div className={classes.buttonsContainer}>
						<Button
							priority="tertiary"
							onClick={() => router.back()}
							nativeButtonProps={{
								"aria-label": "Retour à l'étape précédente",
							}}
						>
							Retour
						</Button>
						<Button
							priority="secondary"
							title="Retour à la page de la déclaration sans publication"
							linkProps={{
								href: `/dashboard/declaration/${declaration.id}`,
							}}
						>
							Continuer sans publier
						</Button>
						<Button priority="primary" onClick={onPublish}>
							Publier la déclaration
						</Button>
					</div>
				</div>
			</section>
		</>
	);
}

const useStyles = tss.withName(DeclarationPreviewPage.name).create({
	main: {
		display: "flex",
		flexDirection: "column",
		paddingBlock: fr.spacing("12v"),
		"& > h1": {
			marginBottom: fr.spacing("4v"),
		},
	},
	declarationPreview: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		padding: fr.spacing("4w"),
		marginTop: fr.spacing("10v"),
		marginBottom: fr.spacing("6v"),

		"& > h2": {
			marginBottom: fr.spacing("10v"),
		},
		"& > h3, h4, h5, h6": {
			marginBottom: fr.spacing("4v"),
		},
		"& > p": {
			marginBottom: fr.spacing("10v"),
		},
	},
	buttonsContainer: {
		display: "grid",
		gap: fr.spacing("4v"),

		"@media (min-width: 600px)": {
			gridTemplateColumns: "1fr auto auto",
		},
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps = (async (context) => {
	const { id } = context.params as Params;

	const redirect: Redirect = {
		destination: "/dashboard",
		permanent: false,
	};

	if (!id || typeof id !== "string") {
		return { redirect };
	}

	const payload = await getPayload({ config });

	const session = await auth.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) return { redirect };

	const declaration = await getDeclarationById(
		payload,
		session,
		Number.parseInt(id),
	);

	if (!declaration) return { redirect };

	const { audit, contact, entity, actionPlan, created_by } = declaration;

	if (!audit || !contact || !entity || !actionPlan || !created_by) {
		return {
			redirect: {
				destination: `/dashboard/declaration/${declaration.id}`,
				permanent: false,
			},
		};
	}

	if (declaration?.publishedContent && declaration.status === "published") {
		return {
			redirect: {
				destination: `/dashboard/declaration/${declaration.id}`,
				permanent: false,
			},
		};
	}

	return {
		props: {
			declaration: declaration as RequiredPopulatedDeclaration,
		},
	};
}) satisfies GetServerSideProps<{
	declaration: RequiredPopulatedDeclaration;
}>;

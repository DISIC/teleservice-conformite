import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useRouter } from "next/router";
import type {
	Entity,
	Audit,
	Contact,
	ActionPlan,
	User,
} from "~/payload/payload-types";

import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import PublishedDeclarationTemplate, {
	extractDeclarationContentToPublish,
	type PublishedDeclaration,
} from "~/components/declaration/PublishedDeclarationTemplate";

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
}: { declaration: RequiredPopulatedDeclaration }) {
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
		<section id="declaration-preview" className={fr.cx("fr-container")}>
			<div className={classes.main}>
				<h1>Votre déclaration est prête à être publiée</h1>
				<p>Voici un aperçu de votre déclaration</p>
				<div className={classes.declarationPreview}>
					<PublishedDeclarationTemplate
						declaration={publishedDeclarationContent}
						mode="preview"
					/>
				</div>
				<div className={classes.buttonsContainer}>
					<Button priority="tertiary" onClick={() => router.back()}>
						Retour
					</Button>
					<Button
						priority="secondary"
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

	const { audit, contact, entity, actionPlan, created_by } = declaration || {};

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	if (!audit || !contact || !entity || !actionPlan || !created_by) {
		return {
			props: {},
			redirect: { destination: `/dashboard/declaration/${declaration.id}` },
		};
	}

	if (declaration?.publishedContent && declaration.status === "published") {
		return {
			props: {},
			redirect: { destination: `/dashboard/declaration/${declaration.id}` },
		};
	}

	return {
		props: {
			declaration,
		},
	};
};

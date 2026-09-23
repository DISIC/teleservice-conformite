import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { tss } from "tss-react";
import PublishedTemplate, {
	extractDeclarationContentToPublish,
} from "~/components/declaration/PublishedTemplate";
import { DeclarationHeading } from "~/components/declaration/DeclarationHeading";
import { PublishSuccess } from "~/components/declaration/PublishSuccess";
import type { Entity, User } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { guardDeclaration } from "~/lib/server-guards";
import type { PublishedDeclaration } from "~/domain/declaration/published/snapshot";
import { getDeclarationState } from "~/domain/declaration/state";
import { getObsolescence } from "~/domain/declaration/obsolescence";

// Only entity and created_by remain nullable relations for the preview.
type RequiredPopulatedDeclaration = Omit<
	PopulatedDeclaration,
	"entity" | "created_by"
> & {
	entity: Entity;
	created_by: User;
};

export default function DeclarationPreviewPage({
	declaration,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	// Publishing stamps today, so the preview must not inherit an old, possibly obsolete, date.
	const publishedDeclarationContent: PublishedDeclaration =
		extractDeclarationContentToPublish(declaration, {
			publishedAt: new Date(),
		});

	const [publishError, setPublishError] = useState<
		"incomplete" | "generic" | null
	>(null);
	// Set once the server has published: the confirmation replaces the preview at the same URL.
	const [publishedAt, setPublishedAt] = useState<Date | null>(null);

	const { mutate: publishDeclaration } = api.declaration.publish.useMutation({
		onSuccess: ({ data }) => {
			setPublishedAt(
				data.published_at ? new Date(data.published_at) : new Date(),
			);
		},
		onError: (error) => {
			setPublishError(
				error.data?.code === "PRECONDITION_FAILED" ? "incomplete" : "generic",
			);
		},
	});

	const onPublish = () => {
		setPublishError(null);
		publishDeclaration({ declarationId: declaration.id });
	};

	const head = (
		<Head>
			<title>
				{publishedAt
					? "Votre déclaration a été publiée"
					: "Votre déclaration est prête à être publiée"}{" "}
				- Déclaration de {declaration.name} - Téléservice Conformité
			</title>
		</Head>
	);

	if (publishedAt) {
		return (
			<>
				{head}
				<DeclarationHeading declaration={declaration} />
				<section
					id="declaration-published"
					className={fr.cx("fr-container", "fr-mt-10v")}
				>
					<PublishSuccess declaration={declaration} publishedAt={publishedAt} />
				</section>
			</>
		);
	}

	return (
		<>
			{head}
			<DeclarationHeading declaration={declaration} />
			<div className={classes.band}>
				<section id="declaration-preview" className={fr.cx("fr-container")}>
					<div className={classes.main}>
						<h2 className={fr.cx("fr-h1", "fr-mb-4v")}>
							Prévisualiser et publier
						</h2>
						<p className={fr.cx("fr-mb-0", "fr-text--xl")}>
							Voici un aperçu de votre déclaration, telle qu’elle sera
							consultable une fois publiée.
							<br />
							Nous vous invitons à la relire pour validation avant publication.
						</p>
						<div className={classes.declarationPreview}>
							<PublishedTemplate
								declaration={publishedDeclarationContent}
								mode="preview"
							/>
						</div>
						{publishError && (
							<Alert
								className={fr.cx("fr-mb-3v")}
								severity="error"
								title="Publication impossible"
								description={
									publishError === "incomplete" ? (
										<>
											La déclaration ne peut pas être publiée car elle est
											incomplète.{" "}
											<Link href={`/dashboard/declarations/${declaration.id}`}>
												Retournez à la déclaration
											</Link>{" "}
											pour compléter les sections manquantes.
										</>
									) : (
										"Une erreur est survenue lors de la publication. Veuillez réessayer."
									)
								}
							/>
						)}
						<div className={classes.buttonsContainer}>
							<Button
								priority="secondary"
								size="large"
								linkProps={{
									href: `/dashboard/declarations/${declaration.id}`,
								}}
							>
								Revenir au formulaire
							</Button>
							<Button priority="primary" size="large" onClick={onPublish}>
								Publier la déclaration
							</Button>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

const useStyles = tss.withName(DeclarationPreviewPage.name).create({
	band: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
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
	},
	buttonsContainer: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: fr.spacing("4v"),
	},
});

export const getServerSideProps = (async (context) => {
	const guarded = await guardDeclaration(context);
	if (!guarded.props) return { redirect: guarded.redirect };

	const { declaration } = guarded.props;
	const { entity, created_by } = declaration;

	if (!entity || !created_by) {
		return {
			redirect: {
				destination: `/dashboard/declarations/${declaration.id}`,
				permanent: false,
			},
		};
	}

	// Nothing to preview when the public page already matches the row, unless it is ageing out.
	if (
		getDeclarationState(declaration) === null &&
		getObsolescence(declaration, new Date()) === "valid"
	) {
		return {
			redirect: {
				destination: `/dashboard/declarations/${declaration.id}`,
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

import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { auth } from "~/utils/auth";

import type { DeclarationWithPopulated } from "~/utils/payload-helper";
import AddFirstDeclaration from "~/components/declaration/AddFirstDeclaration";

interface DeclarationsPageProps {
	declarations: Array<
		DeclarationWithPopulated & { updatedAtFormatted: string }
	>;
	firstDeclaration?: boolean;
}

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { declarations, firstDeclaration = false } = props;
	const router = useRouter();
	const { classes } = useStyles({
		declarationLength: declarations.length || 0,
	});

	if (firstDeclaration) {
		return <AddFirstDeclaration />;
	}

	return (
		<section id="declarations-page" className={classes.main}>
			<h1>Vos déclarations d'accessibilité</h1>
			<div className={classes.buttonWrapper}>
				<Button
					iconId="fr-icon-add-line"
					priority="tertiary"
					onClick={() => router.push("/dashboard/form")}
				>
					Ajouter une declaration
				</Button>
			</div>
			{declarations.length ? (
				<div>
					{declarations.map((declaration) => {
						const { name } = declaration.entity || {};
						const { rate } = declaration.audit || {};

						return (
							<div key={declaration.id} className={classes.declarationCard}>
								<div>
									<div className={classes.declarationTitleWrapper}>
										<h6 className={classes.declarationTitle}>
											<NextLink
												href={`/dashboard/declaration/${declaration.id}`}
											>
												{declaration.name}
											</NextLink>
										</h6>

										<Badge
											noIcon={true}
											small={true}
											severity={
												declaration?.status === "published"
													? "success"
													: undefined
											}
										>
											{declaration?.status === "published"
												? "Publié"
												: "Brouillon"}
										</Badge>
									</div>
									<p className={classes.details}>
										Dernière modification le {declaration.updatedAtFormatted}
									</p>
									<p className={classes.details}>{name}</p>
									<p className={classes.details}>
										Site web - {declaration.url}
									</p>
								</div>
								{rate && (
									<div>
										<p className={classes.auditRateValue}>{rate}%</p>
										<p className={classes.auditRateLabel}>taux conformité</p>
									</div>
								)}
								<div className={classes.buttonsContainer}>
									{declaration.status === "published" && (
										<Button
											iconId="fr-icon-edit-line"
											priority="primary"
											style={{ width: "100%" }}
										>
											Mettre à jour
										</Button>
									)}
									<Button
										iconId="fr-icon-share-line"
										priority="tertiary"
										style={{ width: "100%" }}
									>
										Copier le lien
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className={classes.emptyStateContainer}>
					<Conclusion fontSize="120px" />
					<h2 className={classes.emptyStateTitle}>
						Créez votre déclaration d’accessibilité
					</h2>
					<p className={classes.emptyStateDescription}>
						Publiez une déclaration conforme pour répondre aux obligations
						légales
					</p>
					<Button
						onClick={() => router.push("/dashboard/form")}
						priority="primary"
					>
						Créer une déclaration
					</Button>
				</div>
			)}
		</section>
	);
}

const useStyles = tss
	.withName(DeclarationsPage.name)
	.withParams<{ declarationLength: number }>()
	.create(({ declarationLength }) => ({
		main: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("8v"),
			padding: fr.spacing("10v"),
		},
		buttonWrapper: {
			justifyContent: "flex-end",
			display: declarationLength ? "flex" : "none",
		},
		declarationCard: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
			padding: fr.spacing("4v"),
		},
		declarationTitleWrapper: {
			display: "flex",
			alignItems: "flex-start",
			gap: "10px",
		},
		declarationTitle: {
			marginBottom: fr.spacing("4v"),
			color: fr.colors.decisions.background.actionHigh.blueFrance.default,
		},
		details: {
			fontWeight: 400,
			fontSize: "14px",
			lineHeight: "24px",
			margin: 0,
			color: fr.colors.decisions.border.contrast.grey.default,
		},
		auditRateValue: {
			lineHeight: "36px",
			fontWeight: 700,
			color: fr.colors.decisions.text.label.grey.default,
			fontSize: fr.typography[3].style.fontSize,
			margin: 0,
		},
		auditRateLabel: {
			lineHeight: "24px",
			fontWeight: 400,
			color: fr.colors.decisions.text.label.grey.default,
			fontSize: fr.typography[1].style.fontSize,
		},
		buttonsContainer: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("4v"),
		},
		emptyStateContainer: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("5v"),
			justifyContent: "center",
			alignItems: "center",
			marginTop: fr.spacing("25v"),
		},
		emptyStateTitle: {
			fontFamily: "Marianne",
			fontWeight: 700,
			fontSize: "1.25rem",
			lineHeight: "1.75rem",
		},
		emptyStateDescription: {
			fontFamily: "Marianne",
			fontWeight: 400,
			fontSize: "1.25rem",
			lineHeight: "2rem",
			color: fr.colors.decisions.text.mention.grey.default,
		},
	}));

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const payload = await getPayload({ config });
	const authSession = await auth.api.getSession({
		headers: context.req.headers,
	});

	if (!authSession) {
		return { redirect: { destination: "/" }, props: {} };
	}

	try {
		const result = await payload.find({
			collection: "declarations",
			trash: true,
			depth: 3,
			where: {
				"created_by.id": {
					equals: authSession?.user?.id,
				},
			},
		});

		const deletedDeclarations = (result?.docs || []).filter(
			(doc) => doc?.deletedAt,
		);

		if (!deletedDeclarations.length) {
			return {
				props: {
					firstDeclaration: true,
					declarations: [],
				},
			};
		}

		const declarations = (result?.docs || [])
			.filter((doc) => !doc?.deletedAt)
			.map((doc) => ({
				...doc,
				updatedAtFormatted: new Intl.DateTimeFormat("fr-FR", {
					dateStyle: "short",
					timeStyle: "short",
					timeZone: "Europe/Paris",
				}).format(new Date((doc as any).updatedAt)),
			}));

		return {
			props: {
				declarations,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/" },
			props: {
				declarations: [],
			},
		};
	}
};

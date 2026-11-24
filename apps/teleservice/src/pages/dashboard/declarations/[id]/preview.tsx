import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { tss } from "tss-react";
import DepositedTemplate, {
	extractDeclarationContentToDeposit,
} from "~/components/declaration/DepositedTemplate";
import { DeclarationHeading } from "~/components/declaration/DeclarationHeading";
import { DepositSuccess } from "~/components/declaration/DepositSuccess";
import type { Entity, User } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { guardDeclaration } from "~/lib/server-guards";
import type { DepositedDeclaration } from "~/domain/declaration/deposited/snapshot";
import { getDeclarationState } from "~/domain/declaration/state";
import { getObsolescence } from "~/domain/declaration/obsolescence";
import { pageTitle } from "~/lib/serviceName";

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

	// Depositing stamps today, so the preview must not inherit an old, possibly obsolete, date.
	const depositedDeclarationContent: DepositedDeclaration =
		extractDeclarationContentToDeposit(declaration, {
			depositedAt: new Date(),
		});

	const [depositError, setDepositError] = useState<
		"incomplete" | "generic" | null
	>(null);
	// Set once the server has deposited: the confirmation replaces the preview at the same URL.
	const [depositedAt, setDepositedAt] = useState<Date | null>(null);

	const { mutate: depositDeclaration } = api.declaration.deposit.useMutation({
		onSuccess: ({ data }) => {
			setDepositedAt(
				data.deposited_at ? new Date(data.deposited_at) : new Date(),
			);
		},
		onError: (error) => {
			setDepositError(
				error.data?.code === "PRECONDITION_FAILED" ? "incomplete" : "generic",
			);
		},
	});

	const onDeposit = () => {
		setDepositError(null);
		depositDeclaration({ declarationId: declaration.id });
	};

	const head = (
		<Head>
			<title>
				{pageTitle(
					`Prévisualisation de la déclaration d’accessibilité de ${declaration.name}`,
				)}
			</title>
		</Head>
	);

	if (depositedAt) {
		return (
			<>
				{head}
				<DeclarationHeading declaration={declaration} />
				<section
					id="declaration-deposited"
					className={fr.cx("fr-container", "fr-mt-10v")}
				>
					<DepositSuccess declaration={declaration} depositedAt={depositedAt} />
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
							Prévisualiser la déclaration
						</h2>
						<p className={fr.cx("fr-mb-0", "fr-text--xl")}>
							Voici un aperçu de votre déclaration, telle qu’elle sera
							consultable une fois déposée sur le téléservice.
							<br />
							Nous vous invitons à la relire pour validation avant envoi.
						</p>
						<div className={classes.declarationPreview}>
							<DepositedTemplate
								declaration={depositedDeclarationContent}
								mode="preview"
							/>
						</div>
						{depositError && (
							<Alert
								className={fr.cx("fr-mb-3v")}
								severity="error"
								title="Dépôt impossible"
								description={
									depositError === "incomplete" ? (
										<>
											La déclaration ne peut pas être déposée car elle est
											incomplète.{" "}
											<Link href={`/dashboard/declarations/${declaration.id}`}>
												Retournez à la déclaration
											</Link>{" "}
											pour compléter les sections manquantes.
										</>
									) : (
										"Une erreur est survenue lors du dépôt. Veuillez réessayer."
									)
								}
							/>
						)}
						<div className={classes.sticky}>
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
								<Button priority="primary" size="large" onClick={onDeposit}>
									Déposer la déclaration
								</Button>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}

const useStyles = tss.withName({ DeclarationPreviewPage }).create({
	band: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	main: {
		display: "flex",
		flexDirection: "column",
		paddingTop: fr.spacing("12v"),
		"& > h1": {
			marginBottom: fr.spacing("4v"),
		},
	},
	declarationPreview: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		padding: fr.spacing("4w"),
		marginTop: fr.spacing("10v"),
		minWidth: 0,
		"@media (max-width: 576px)": {
			padding: fr.spacing("2w"),
		},
	},
	sticky: {
		position: "sticky",
		bottom: 0,
		zIndex: 1,
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	buttonsContainer: {
		paddingTop: fr.spacing("6v"),
		paddingBottom: fr.spacing("12v"),
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

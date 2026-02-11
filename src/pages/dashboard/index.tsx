import { useEffect, useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

import { auth } from "~/utils/auth";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import AddFirstDeclaration from "~/components/declaration/AddFirstDeclaration";
import { copyToClipboard } from "~/utils/declaration-helper";
import { StatusBadge } from "~/components/declaration/DeclarationStatusBadge";
import { appKindOptions } from "~/payload/selectOptions";
import EmptyState from "~/components/declaration/EmptyState";

interface DeclarationsPageProps {
	declarations: Array<PopulatedDeclaration & { updatedAtFormatted: string }>;
	firstDeclaration?: boolean;
}

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { declarations, firstDeclaration = false } = props;
	const router = useRouter();
	const { classes, cx } = useStyles({
		declarationLength: declarations.length || 0,
	});
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<{
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}>({ title: "", description: "", severity: "info" });

	if (firstDeclaration) {
		return <AddFirstDeclaration />;
	}

	const showDeclarationAlert = ({
		title,
		description,
		severity,
	}: {
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}) => {
		setAlertDetails({ title, description, severity });
		setShowAlert(true);
	};

	useEffect(() => {
		if (!showAlert) return;

		const timer = setTimeout(() => {
			setShowAlert(false);
		}, 5000);

		return () => clearTimeout(timer);
	}, [showAlert]);

	return (
		<div className={fr.cx("fr-container")}>
			<section id="declarations-page" className={classes.main}>
				<h1>Vos déclarations d'accessibilité</h1>
				{showAlert && (
					<div className={classes.alertWrapper}>
						<Alert
							small={true}
							severity={alertDetails.severity}
							title={alertDetails?.title ?? ""}
							description={alertDetails?.description ?? ""}
							closable
							isClosed={!showAlert}
							onClose={() => setShowAlert(false)}
						/>
					</div>
				)}

				{declarations.length ? (
					<>
						<div className={classes.buttonWrapper}>
							<Button
								iconId="fr-icon-add-line"
								priority="tertiary"
								linkProps={{
									href: "/dashboard/form",
								}}
							>
								Ajouter une declaration
							</Button>
						</div>
						<div>
							{declarations.map((declaration) => {
								const { name } = declaration.entity || {};
								const { rate } = declaration.audit || {};

								return (
									<div key={declaration.id} className={classes.declarationCard}>
										<div>
											<h6 className={classes.declarationTitle}>
												<NextLink
													href={`/dashboard/declaration/${declaration.id}`}
												>
													{declaration.name}
												</NextLink>
												<StatusBadge
													isPublished={declaration?.status === "published"}
													isModified={
														declaration?.status === "unpublished" &&
														!!declaration?.publishedContent
													}
													isDraft={
														declaration?.status !== "published" &&
														!declaration?.publishedContent
													}
												/>
											</h6>
											<p className={classes.details}>
												Dernière modification le{" "}
												{declaration.updatedAtFormatted}
											</p>
											<p className={classes.details}>{name}</p>
											<p className={classes.details}>
												{appKindOptions.find(
													(option) => option.value === declaration.app_kind,
												)?.label ?? declaration.app_kind}
												{declaration.url && declaration.app_kind === "website"
													? ` - ${declaration.url}`
													: ""}
											</p>
										</div>
										<div
											style={
												declaration.status === "published" && rate !== undefined
													? { visibility: "visible" }
													: { visibility: "hidden" }
											}
										>
											<p className={classes.auditRateValue}>{rate}%</p>
											<p className={classes.auditRateLabel}>taux conformité</p>
										</div>
										<Button
											iconId="fr-icon-share-line"
											priority="tertiary"
											style={{ width: "100%" }}
											onClick={() =>
												copyToClipboard(
													`${process.env.NEXT_PUBLIC_FRONT_URL}/dashboard/declaration/${declaration.id}`,
													() =>
														showDeclarationAlert({
															description: "Lien copié dans le presse-papier",
															severity: "success",
														}),
												)
											}
										>
											Copier le lien
										</Button>
									</div>
								);
							})}
						</div>
					</>
				) : (
					<EmptyState />
				)}
			</section>
		</div>
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
			paddingBlock: fr.spacing("12v"),
		},
		buttonWrapper: {
			justifyContent: "flex-end",
			display: declarationLength ? "flex" : "none",
		},
		declarationCard: {
			display: "grid",
			gridTemplateColumns: "2fr 1fr auto",
			alignItems: "center",
			border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
			padding: fr.spacing("4v"),
		},
		declarationTitle: {
			marginBottom: fr.spacing("4v"),
			color: fr.colors.decisions.background.actionHigh.blueFrance.default,

			"& a": {
				marginRight: fr.spacing("1v"),
			},
		},
		details: {
			fontWeight: 400,
			fontSize: "1rem",
			lineHeight: "1.5rem",
			margin: 0,
			color: fr.colors.decisions.border.contrast.grey.default,
		},
		auditRateValue: {
			lineHeight: "2.25rem",
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
		alertWrapper: {
			width: "100%",
			display: "flex",
			marginTop: fr.spacing("8v"),

			"& div": {
				width: "100%",
			},
		},
	}));

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

		const declarations = (result?.docs || [])
			.filter((doc) => !doc?.deletedAt)
			.map((doc) => ({
				...doc,
				updatedAtFormatted: new Date(doc.updatedAt).toLocaleDateString("fr-FR"),
			}));

		const deletedDeclarations = (result?.docs || []).filter(
			(doc) => doc?.deletedAt,
		);

		if (!deletedDeclarations.length && declarations?.length === 0) {
			return {
				props: {
					firstDeclaration: true,
					declarations: [],
				},
			};
		}

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

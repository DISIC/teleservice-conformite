import { useEffect, useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

import { auth } from "~/utils/auth";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import AddFirstDeclaration from "~/components/declaration/AddFirstDeclaration";
import EmptyState from "~/components/declaration/EmptyState";
import DeclarationListItem from "~/components/declaration/DeclarationListItem";

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
							{declarations.map((declaration) => (
								<DeclarationListItem
									key={declaration.id}
									declaration={declaration}
								/>
							))}
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
			fontSize: fr.typography[22].style.fontSize,
			lineHeight: fr.typography[20].style.lineHeight,
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

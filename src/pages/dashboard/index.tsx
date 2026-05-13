import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import config from "@payload-config";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import AddFirstDeclaration from "~/components/declaration/AddFirstDeclaration";
import EmptyState from "~/components/declaration/EmptyState";
import Table from "~/components/system/Table";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { auth } from "~/utils/auth";

interface DeclarationsPageProps {
	declarations: Array<PopulatedDeclaration & { updatedAtFormatted: string }>;
	firstDeclaration?: boolean;
}

const columnHelper = createColumnHelper<PopulatedDeclaration>();

const defaultColumns = [
	columnHelper.accessor("name", {
		header: "Nom de la déclaration",
	}),
	columnHelper.accessor("app_kind", {
		header: "Type",
		cell: (info) => (
			<Tag small>
				{
					appKindOptions.find((option) => option.value === info.getValue())
						?.label
				}
			</Tag>
		),
	}),
	columnHelper.accessor("status", {
		header: "Statut",
		cell: (info) => (
			<Badge
				noIcon
				small
				severity={info.getValue() === "published" ? "success" : undefined}
			>
				{info.getValue() === "published" ? "Publié" : "Brouillon"}
			</Badge>
		),
	}),
	columnHelper.accessor("updatedAt", {
		header: "Dernière mise à jour",
		cell: (info) => {
			const date = new Date(info.getValue());
			return date.toLocaleDateString("fr-FR");
		},
	}),
	columnHelper.accessor("audit.rate", {
		header: "Taux d'accessibilité",
		cell: (info) => {
			const rate = info.getValue();

			if (rate === undefined || rate === null) return "-";

			return (
				<Badge
					noIcon
					small
					severity={rate >= 90 ? "success" : rate >= 75 ? "warning" : "error"}
				>
					{`${rate}%`}
				</Badge>
			);
		},
		meta: {
			isNumeric: true,
		},
		id: "audit.rate",
		enableSorting: false,
	}),
	columnHelper.display({
		id: "actions",
		cell: (info) => (
			<Button
				linkProps={{ href: `/dashboard/${info.row.original.id}` }}
				iconPosition="right"
				iconId="fr-icon-arrow-right-line"
				priority="secondary"
				size="small"
			>
				Consulter
			</Button>
		),
	}),
];

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { declarations, firstDeclaration = false } = props;
	const { classes } = useStyles({
		declarationLength: declarations.length || 0,
	});
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<{
		title?: string;
		description?: string;
		severity: "info" | "success" | "warning" | "error";
	}>({ title: "", description: "", severity: "info" });

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

	if (firstDeclaration) {
		return <AddFirstDeclaration />;
	}

	return (
		<div className={fr.cx("fr-container")}>
			<section id="declarations-page" className={classes.main}>
				<h1>Déclarations d'accessibilité</h1>
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
					<div>
						<div className={classes.buttonWrapper}>
							<Button
								iconId="fr-icon-add-line"
								linkProps={{ href: "/dashboard/form" }}
							>
								Ajouter une déclaration
							</Button>
						</div>
						<Table columns={defaultColumns} data={declarations} />
					</div>
				) : (
					<EmptyState
						title="Bienvenue !"
						description="Ajoutez votre première déclaration d’accessibilité pour démarrer"
						ctaProps={{
							linkProps: { href: "/dashboard/form" },
							children: "Ajouter une déclaration",
							iconId: "fr-icon-add-line",
						}}
					/>
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
			gap: fr.spacing("10v"),
			paddingBlock: fr.spacing("12v"),
		},
		buttonWrapper: {
			justifyContent: "flex-end",
			display: declarationLength ? "flex" : "none",
		},
		alertWrapper: {
			width: "100%",
			display: "flex",
			"& div": {
				width: "100%",
			},
		},
		declarationCardsContainer: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("6v"),
		},
	}));

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
				"accessRights.user": { equals: authSession?.user?.id },
				"accessRights.status": { equals: "approved" },
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

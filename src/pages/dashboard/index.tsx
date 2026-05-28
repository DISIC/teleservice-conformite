import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import config from "@payload-config";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps, Redirect } from "next";
import Link from "next/link";
import { getPayload } from "payload";
import { useCallback, useEffect, useMemo, useState } from "react";
import { tss } from "tss-react";
import EmptyState from "~/components/ui/EmptyState";
import InfoBlock from "~/components/ui/InfoBlock";
import Table from "~/components/ui/Table";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { auth } from "~/lib/auth";
import {
	copyToClipboard,
	getConformityStatus,
} from "~/utils/declaration-helper";

interface DeclarationsPageProps {
	declarations: Array<PopulatedDeclaration & { updatedAtFormatted: string }>;
	firstDeclaration?: boolean;
	entityName: string;
}

const NUMBER_PER_PAGE = 10;

const columnHelper = createColumnHelper<PopulatedDeclaration>();

const defaultColumns = [
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
	columnHelper.accessor((row) => row.audit?.rate, {
		header: "Taux de conformité",
		cell: (info) => {
			const rate = info.getValue();

			if (rate === undefined || rate === null) return "-";

			const conformityStatus = getConformityStatus(rate);

			return (
				<Tooltip kind="hover" title={conformityStatus.label}>
					<Badge noIcon small severity={conformityStatus.severity}>
						{`${rate}%`}
					</Badge>
				</Tooltip>
			);
		},
	}),
];

const buildActionsColumn = (onCopySuccess: (declarationName: string) => void) =>
	columnHelper.display({
		id: "actions",
		meta: { noRowLink: true },
		cell: (info) => {
			const declaration = info.row.original;
			if (declaration.status !== "published") return null;
			return (
				<div style={{ display: "flex", justifyContent: "flex-end" }}>
					<Button
						iconId="fr-icon-share-line"
						iconPosition="left"
						priority="tertiary no outline"
						size="small"
						onClick={() =>
							copyToClipboard(
								`${process.env.NEXT_PUBLIC_FRONT_URL}/declarations/${declaration.id}/publish`,
								() => onCopySuccess(declaration.name || ""),
							)
						}
						nativeButtonProps={{
							"aria-label": "Copier le lien web de la déclaration publiée",
						}}
					>
						Partager le lien public
					</Button>
				</div>
			);
		},
	});

type AlertDetailsProps = {
	description?: string;
	severity: "info" | "success" | "warning" | "error";
};

export default function DeclarationsPage(props: DeclarationsPageProps) {
	const { declarations, entityName } = props;
	const { classes } = useStyles({
		declarationLength: declarations.length || 0,
	});
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<AlertDetailsProps>({
		description: "",
		severity: "info",
	});

	const showDeclarationAlert = useCallback(
		({ description, severity }: AlertDetailsProps) => {
			setAlertDetails({ description, severity });
			setShowAlert(true);
		},
		[],
	);

	const onCopySuccess = useCallback(
		(declarationName: string) =>
			showDeclarationAlert({
				description: `Lien de la déclaration ${declarationName} copié dans le presse-papier`,
				severity: "success",
			}),
		[showDeclarationAlert],
	);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: "Nom de la déclaration",
				meta: { styles: { maxWidth: 240 } },
				cell: (info) => (
					<span className={classes.nameLink}>{info.getValue()}</span>
				),
			}),
			...defaultColumns,
			buildActionsColumn(onCopySuccess),
		],
		[onCopySuccess, classes.nameLink],
	);

	useEffect(() => {
		if (!showAlert) return;

		const timer = setTimeout(() => setShowAlert(false), 5000);

		return () => clearTimeout(timer);
	}, [showAlert]);

	return (
		<div className={fr.cx("fr-container")}>
			<section id="declarations-page" className={classes.main}>
				<h1>Déclarations d'accessibilité</h1>
				{showAlert && (
					<div className={classes.alertWrapper}>
						<Alert
							small
							severity={alertDetails.severity}
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
						<Table
							columns={columns}
							data={declarations}
							numberPerPage={NUMBER_PER_PAGE}
							getRowHref={(row) => `/dashboard/declarations/${row.id}`}
						/>
					</div>
				) : (
					<EmptyState
						title="Bienvenue !"
						description="Ajoutez votre première déclaration d’accessibilité pour démarrer"
						pictogram={<Conclusion fontSize="3rem" />}
						ctaProps={{
							linkProps: { href: "/dashboard/form" },
							children: "Ajouter une déclaration",
							iconId: "fr-icon-add-line",
						}}
					/>
				)}
				<div className={classes.infoBlocksContainer}>
					<Link href="/dashboard/library" className={classes.infoBlockLink}>
						<InfoBlock organizationName={entityName} title="Documents partagés">
							Retrouvez et gérez les schémas pluriannuels, plans d’actions et
							contacts de votre organisation nécessaire à votre déclaration
							d’accessibilité
						</InfoBlock>
					</Link>
					<Link
						href="/dashboard/declarations"
						className={classes.infoBlockLink}
					>
						<InfoBlock
							organizationName={entityName}
							title="Toutes les déclarations"
						>
							Visualisez toutes les déclarations créées dans votre organisation
						</InfoBlock>
					</Link>
				</div>
			</section>
		</div>
	);
}

const useStyles = tss
	.withName(DeclarationsPage.name)
	.withParams<{ declarationLength: number }>()
	.create(({ declarationLength }) => ({
		main: {
			paddingBlock: fr.spacing("12v"),
		},
		buttonWrapper: {
			justifyContent: "flex-end",
			display: declarationLength ? "flex" : "none",
			marginBottom: fr.spacing("6v"),
		},
		alertWrapper: {
			width: "100%",
			display: "flex",
			"& div": {
				width: "100%",
			},
			marginBottom: fr.spacing("6v"),
			animation: "fadeIn 0.25s ease-in-out",
		},
		declarationCardsContainer: {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("6v"),
		},
		infoBlockLink: {
			textDecoration: "none",
			color: "inherit",
			backgroundImage: "none",
			"&:hover": {
				filter: "brightness(0.97)",
			},
		},
		infoBlocksContainer: {
			marginTop: fr.spacing("12v"),
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
			gap: fr.spacing("10v"),
		},
		nameLink: {
			fontWeight: 500,
		},
	}));

export const getServerSideProps = (async (context) => {
	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	const [payload, authSession] = await Promise.all([
		getPayload({ config }),
		auth.api.getSession({
			headers: new Headers(context.req.headers as HeadersInit),
		}),
	]);

	if (!authSession) return { redirect };

	try {
		const user = await payload.findByID({
			collection: "users",
			id: Number(authSession.user.id),
			depth: 1,
		});

		const currentEntity =
			user?.entity && typeof user.entity === "object" ? user.entity : null;

		if (!currentEntity) {
			return { redirect: { destination: "/", permanent: false } };
		}

		const result = await payload.find({
			collection: "declarations",
			trash: true,
			depth: 3,
			where: {
				"accessRights.user": { equals: authSession?.user?.id },
				"accessRights.status": { equals: "approved" },
			},
		});

		const allDocs = result?.docs || [];
		const declarations: Array<
			PopulatedDeclaration & { updatedAtFormatted: string }
		> = [];
		const deletedDeclarations: typeof allDocs = [];
		for (const doc of allDocs) {
			if (doc?.deletedAt) {
				deletedDeclarations.push(doc);
				continue;
			}
			declarations.push({
				...doc,
				audit: doc.audit?.docs?.[0] || null,
				updatedAtFormatted: new Date(doc.updatedAt).toLocaleDateString("fr-FR"),
			} as PopulatedDeclaration & { updatedAtFormatted: string });
		}

		return {
			props: {
				firstDeclaration: !declarations.length,
				declarations,
				entityName: currentEntity.name,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return { redirect };
	}
}) satisfies GetServerSideProps<DeclarationsPageProps>;

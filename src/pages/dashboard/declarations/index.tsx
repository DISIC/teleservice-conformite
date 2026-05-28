import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import config from "@payload-config";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useCallback, useEffect, useMemo, useState } from "react";
import { tss } from "tss-react";
import Table from "~/components/ui/Table";
import type { Entity } from "~/payload/payload-types";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { authPages } from "~/lib/auth";
import { copyToClipboard } from "~/utils/declaration-helper";
import { Alert } from "@codegouvfr/react-dsfr/Alert";

interface EntityDeclarationsPageProps {
	entity: Entity;
	declarations: PopulatedDeclaration[];
}

const NUMBER_PER_PAGE = 10;

const columnHelper = createColumnHelper<PopulatedDeclaration>();

export default function EntityDeclarationsPage({
	entity,
	declarations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const { back } = useRouter();

	const [alertMessage, setAlertMessage] = useState<string | null>(null);

	const onCopySuccess = useCallback(
		(declarationName: string) =>
			setAlertMessage(
				`Lien de la déclaration ${declarationName} copié dans le presse-papier`,
			),
		[],
	);

	useEffect(() => {
		if (!alertMessage) return;
		const timer = setTimeout(() => setAlertMessage(null), 5000);
		return () => clearTimeout(timer);
	}, [alertMessage]);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: "Nom de la déclaration",
				meta: { styles: { maxWidth: 240 } },
				cell: (info) => (
					<Link
						href={`/dashboard/declarations/${info.row.original.id}`}
						className={classes.nameLink}
					>
						{info.getValue()}
					</Link>
				),
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
			columnHelper.display({
				id: "actions",
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
										`${process.env.NEXT_PUBLIC_FRONT_URL}/declaration/${declaration.id}/publish`,
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
			}),
		],
		[classes.nameLink, onCopySuccess],
	);

	return (
		<>
			<Head>
				<title>Toutes les déclarations - Téléservice Conformité</title>
			</Head>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					<Button
						priority="secondary"
						onClick={() => back()}
						iconId="fr-icon-arrow-left-s-line"
						size="small"
					>
						Retour sur la liste des déclarations
					</Button>
					<div className={classes.headerWrapper}>
						<h1>Toutes les déclarations</h1>
						<Badge noIcon small>
							Visible par tous les membres de {entity.name}
						</Badge>
					</div>
					{alertMessage && (
						<div className={classes.alertWrapper}>
							<Alert
								small
								severity="success"
								description={alertMessage}
								closable
								onClose={() => setAlertMessage(null)}
							/>
						</div>
					)}
					{declarations.length ? (
						<Table
							columns={columns}
							data={declarations}
							numberPerPage={NUMBER_PER_PAGE}
						/>
					) : (
						<p className={classes.empty}>
							Aucune déclaration dans votre organisation pour le moment
						</p>
					)}
				</div>
			</div>
		</>
	);
}

const useStyles = tss.withName(EntityDeclarationsPage.name).create({
	main: {
		paddingBlock: fr.spacing("12v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("8v"),
	},
	headerWrapper: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
		flexWrap: "wrap",
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		"& div": { width: "100%" },
		animation: "fadeIn 0.25s ease-in-out",
	},
	empty: {
		color: fr.colors.decisions.text.mention.grey.default,
		fontStyle: "italic",
	},
	nameLink: {
		color: "inherit",
		backgroundImage: "none",
		fontWeight: 500,
		transition: "color 0.15s ease",
		"&:hover": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});

export const getServerSideProps = (async (context) => {
	const session = await authPages.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	if (!session) {
		return { redirect: { destination: "/", permanent: false } };
	}

	const payload = await getPayload({ config });
	const user = await payload.findByID({
		collection: "users",
		id: Number(session.user.id),
		depth: 1,
	});

	const entity =
		user?.entity && typeof user.entity === "object" ? user.entity : null;

	if (!entity) {
		return { redirect: { destination: "/dashboard", permanent: false } };
	}

	const result = await payload.find({
		collection: "declarations",
		depth: 1,
		where: {
			entity: { equals: entity.id },
		},
		limit: 1000,
	});

	const declarations = (result?.docs ?? []).map(
		(doc) => doc as PopulatedDeclaration,
	);

	return { props: { entity, declarations } };
}) satisfies GetServerSideProps<EntityDeclarationsPageProps>;

import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Contract from "@codegouvfr/react-dsfr/picto/Contract";
import { createColumnHelper } from "@tanstack/react-table";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tss } from "tss-react";
import { PageHeading } from "~/components/layout/PageHeading";
import EmptyState from "~/components/ui/EmptyState";
import Table from "~/components/ui/Table";
import type { Entity } from "~/payload/payload-types";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { copyToClipboard } from "~/lib/clipboard";
import { loadEntityForPage } from "~/lib/server-guards";
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

	const alertRef = useRef<HTMLDivElement>(null);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);

	const onCopySuccess = useCallback(
		(declarationName: string) =>
			setAlertMessage(
				`Lien de la déclaration ${declarationName} copié dans le presse-papier`,
			),
		[],
	);

	useEffect(() => {
		if (alertMessage) alertRef.current?.focus();
	}, [alertMessage]);

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: "Nom de la déclaration",
				meta: { styles: { maxWidth: 240 } },
				cell: (info) => <span className={classes.name}>{info.getValue()}</span>,
			}),
			columnHelper.accessor("app_kind", {
				header: "Type",
				cell: (info) => (
					<Tag small>
						{appKindOptions.find((option) => option.value === info.getValue())
							?.label ?? "—"}
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
					const publicUrl = `/declarations/${declaration.id}/publish`;
					return (
						<div className={classes.actions}>
							<Button
								iconId="fr-icon-link"
								priority="secondary"
								size="small"
								title={`Copier le lien public de la déclaration ${declaration.name}`}
								onClick={() =>
									copyToClipboard(
										`${process.env.NEXT_PUBLIC_FRONT_URL}${publicUrl}`,
										() => onCopySuccess(declaration.name || ""),
									)
								}
							/>
							<Button
								iconId="fr-icon-eye-line"
								priority="secondary"
								size="small"
								title={`Voir la déclaration ${declaration.name}, nouvelle fenêtre`}
								linkProps={{
									href: publicUrl,
									target: "_blank",
									rel: "noopener noreferrer",
								}}
							/>
						</div>
					);
				},
			}),
		],
		[classes.actions, classes.name, onCopySuccess],
	);

	return (
		<>
			<Head>
				<title>
					Toutes les déclarations de l’organisation - Téléservice Conformité
				</title>
			</Head>
			<PageHeading
				title="Toutes les déclarations de l’organisation"
				pictogram={<Contract fontSize="3.5rem" />}
				entityName={entity.name}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{alertMessage && (
						<div className={classes.alertWrapper} ref={alertRef} tabIndex={-1}>
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
						<EmptyState
							pictogram={<Contract fontSize="3rem" />}
							title="Il n’y a aucune déclaration d’accessibilité."
							description={`Retrouvez ici toutes les déclarations créées dans votre organisation ${entity.name}`}
						/>
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
		gap: fr.spacing("6v"),
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		"& div": { width: "100%" },
		animation: "fadeIn 0.25s ease-in-out",
	},
	name: {
		fontWeight: 500,
	},
	actions: {
		display: "flex",
		justifyContent: "flex-end",
		gap: fr.spacing("2v"),
	},
});

export const getServerSideProps = (async (context) => {
	const { payload, session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };
	if (!entity)
		return { redirect: { destination: "/dashboard", permanent: false } };

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

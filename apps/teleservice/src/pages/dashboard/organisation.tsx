import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Contract from "@codegouvfr/react-dsfr/picto/Contract";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useState } from "react";
import { tss } from "tss-react";
import { DECLARATION_FAQ } from "~/components/ui/emptyStateFaq";
import {
	type DeclarationAction,
	useDeclarationColumns,
} from "~/components/declaration/tableColumns";
import { PageHeading } from "~/components/layout/PageHeading";
import {
	CreateDeclarationModal,
	type CreateDeclarationModalActions,
} from "~/components/modal/CreateDeclarationModal";
import EmptyState from "~/components/ui/EmptyState";
import Table from "~/components/ui/Table";
import type { Entity } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { loadEntityForPage } from "~/lib/server-guards";
import { pageTitle } from "~/lib/serviceName";

interface EntityDeclarationsPageProps {
	entity: Entity;
	declarations: PopulatedDeclaration[];
}

const NUMBER_PER_PAGE = 10;

const ACTIONS: DeclarationAction[] = ["view"];

export default function EntityDeclarationsPage({
	entity,
	declarations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();

	const [createModalActions] = useState<CreateDeclarationModalActions>({});

	const columns = useDeclarationColumns({
		rowLink: false,
		actions: ACTIONS,
	});

	return (
		<>
			<Head>
				<title>{pageTitle("Toutes les déclarations de l’organisation")}</title>
			</Head>
			<PageHeading
				title="Toutes les déclarations de l’organisation"
				pictogram={<Contract fontSize="3.5rem" />}
				entityName={entity.name}
				actions={
					<Button
						iconId="ri-download-line"
						onClick={() => createModalActions.open?.()}
					>
						Déposer une déclaration
					</Button>
				}
			/>
			<div className={fr.cx("fr-container")}>
				<div className={classes.main}>
					{declarations.length ? (
						<Table
							caption="Liste des déclarations d’accessibilité de l’organisation"
							columns={columns}
							data={declarations}
							numberPerPage={NUMBER_PER_PAGE}
						/>
					) : (
						<EmptyState
							pictogram={<Contract fontSize="3rem" />}
							title="Votre organisation n’a déposé aucune déclaration"
							description={`Retrouvez ici toutes les déclarations créées dans votre organisation ${entity.name}`}
							faq={DECLARATION_FAQ}
							ctaProps={{
								onClick: () => createModalActions.open?.(),
								children: "Déposer une déclaration",
								iconId: "ri-download-line",
							}}
						/>
					)}
				</div>
			</div>
			<CreateDeclarationModal actions={createModalActions} entity={entity} />
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
});

export const getServerSideProps = (async (context) => {
	const { payload, session, entity } = await loadEntityForPage(context);

	if (!session) return { redirect: { destination: "/", permanent: false } };
	if (!entity)
		return {
			redirect: { destination: "/dashboard/declarations", permanent: false },
		};

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

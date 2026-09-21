import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Binders from "@codegouvfr/react-dsfr/picto/Binders";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { tss } from "tss-react";
import { ObsolescenceLine } from "~/components/declaration/ObsolescenceLine";
import { StatusBadge } from "~/components/declaration/StatusBadge";
import { PageHeading } from "~/components/layout/PageHeading";
import {
	ConfirmationModal,
	type ConfirmationModalActions,
} from "~/components/modal/ConfirmationModal";
import { BackButton } from "~/components/ui/BackButton";
import { getDeclarationStatus } from "~/domain/declaration/status";
import { api } from "~/lib/api";
import { copyToClipboard } from "~/lib/clipboard";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

const DECLARATIONS_LIST = "/dashboard/declarations";

/** Identity band of a declaration — title, entity, status, and the actions that
 *  apply to the declaration as a whole. Shared by its details and preview pages. */
export function DeclarationHeading({
	declaration,
}: {
	declaration: PopulatedDeclaration;
}) {
	const router = useRouter();
	const { classes } = useStyles();
	const [linkCopied, setLinkCopied] = useState(false);
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});

	const isPublished = getDeclarationStatus(declaration) === "published";
	const publicHref = `/declarations/${declaration.id}/publish`;

	const { mutate: deleteDeclaration } = api.declaration.delete.useMutation({
		onSuccess: () => {
			router.push(DECLARATIONS_LIST);
		},
		onError: (error) => {
			console.error("Error deleting declaration:", error);
		},
	});

	useEffect(() => {
		if (!linkCopied) return;
		const timer = setTimeout(() => setLinkCopied(false), 5000);
		return () => clearTimeout(timer);
	}, [linkCopied]);

	const confirmDelete = () =>
		confirmationModalActions.open?.({
			title: "Supprimer la déclaration",
			confirmLabel: "Supprimer",
			confirmIconId: "fr-icon-delete-fill",
			description: (
				<div className={classes.emptyStateContainer}>
					<Binders fontSize="250px" />
					<div>
						<p>
							Cette action est irréversible et entrainera la suppression de la
							page publique de la déclaration.
						</p>
						<p>
							Nous vous rappelons que chaque site doit fournir une déclaration
							d'accessibilité accessible aux usagers.
						</p>
						<p>
							Si votre déclaration arrive en fin de validité, vous pouvez la
							mettre à jour depuis l'onglet « Déclaration » de votre
							déclaration.
						</p>
					</div>
				</div>
			),
			onConfirm: () => deleteDeclaration({ declarationId: declaration.id }),
		});

	return (
		<>
			<PageHeading
				title={declaration.name}
				entityName={declaration.entity?.name}
				subline={<ObsolescenceLine declaration={declaration} />}
				backButton={
					<BackButton href={DECLARATIONS_LIST}>
						Retourner à la liste de mes déclarations
					</BackButton>
				}
				badge={<StatusBadge declaration={declaration} />}
				actions={
					<>
						{isPublished && (
							<>
								<Button
									priority="tertiary"
									size="small"
									linkProps={{
										href: publicHref,
										target: "_blank",
										rel: "noopener noreferrer",
										title: `Voir la déclaration ${declaration.name}, nouvelle fenêtre`,
									}}
								>
									Voir la déclaration
								</Button>
								<Button
									priority="tertiary"
									iconId="ri-file-copy-line"
									size="small"
									nativeButtonProps={{
										"aria-label":
											"Copier le lien web de la déclaration publiée",
									}}
									onClick={() =>
										copyToClipboard(
											`${process.env.NEXT_PUBLIC_FRONT_URL}${publicHref}`,
											() => setLinkCopied(true),
										)
									}
								>
									Copier le lien
								</Button>
							</>
						)}
						<Button
							iconId="fr-icon-delete-line"
							priority="tertiary"
							onClick={confirmDelete}
							size="small"
							nativeButtonProps={{
								"aria-label": "Supprimer la déclaration",
							}}
						>
							Supprimer
						</Button>
					</>
				}
			/>
			{linkCopied && (
				<div className={fr.cx("fr-container", "fr-mt-4v")}>
					<Alert
						small
						severity="success"
						description="Lien de la déclaration publiée copié dans le presse-papier"
						closable
						onClose={() => setLinkCopied(false)}
					/>
				</div>
			)}
			<ConfirmationModal actions={confirmationModalActions} />
		</>
	);
}

const useStyles = tss.withName(DeclarationHeading.name).create({
	emptyStateContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: fr.spacing("8v"),
		backgroundColor: fr.colors.decisions.background.open.blueFrance.default,
		padding: fr.spacing("6v"),
		"& > div": {
			"& p:last-child": {
				marginBottom: 0,
			},
		},
	},
});

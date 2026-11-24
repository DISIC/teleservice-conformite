import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { logMutationError } from "~/components/declaration/logMutationError";
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
import { newTabLinkProps } from "~/lib/newTabLink";

const DECLARATIONS_LIST = "/dashboard/declarations";

/** Identity band of a declaration — title, entity, status, and the actions that
 *  apply to the declaration as a whole. Shared by its details and preview pages. */
export function DeclarationHeading({
	declaration,
}: {
	declaration: PopulatedDeclaration;
}) {
	const router = useRouter();
	const [notice, setNotice] = useState<{
		severity: "success" | "error";
		description: string;
	} | null>(null);
	const [confirmationModalActions] = useState<ConfirmationModalActions>({});

	const isDeposited = getDeclarationStatus(declaration) !== "draft";
	const publicHref = `/declarations/${declaration.id}/publish`;

	const { mutate: deleteDeclaration } = api.declaration.delete.useMutation({
		onSuccess: () => {
			router.push(
				{ pathname: DECLARATIONS_LIST, query: { deleted: declaration.name } },
				DECLARATIONS_LIST,
			);
		},
		onError: (error) => {
			logMutationError("deleting declaration", declaration.id)(error);
			setNotice({
				severity: "error",
				description:
					"La suppression de la déclaration a échoué. Veuillez réessayer.",
			});
		},
	});

	// A failure stays until dismissed; a confirmation fades.
	useEffect(() => {
		if (notice?.severity !== "success") return;
		const timer = setTimeout(() => setNotice(null), 5000);
		return () => clearTimeout(timer);
	}, [notice]);

	const confirmDelete = () =>
		confirmationModalActions.open?.({
			title: isDeposited
				? "Vous vous apprêtez à supprimer une déclaration déjà déposée."
				: "Supprimer la déclaration",
			confirmLabel: "Supprimer la déclaration",
			confirmIconId: "fr-icon-delete-line",
			confirmBackgroundColor:
				fr.colors.decisions.background.actionHigh.error.default,
			description: isDeposited ? (
				<>
					<p>
						Cette action est <strong>irréversible</strong> et entrainera la{" "}
						<strong>suppression de la page publique</strong> de la déclaration.
						Chaque service doit fournir une déclaration d'accessibilité aux
						usagers.
					</p>
					<p>
						Si votre déclaration arrive en fin de validité, vous devez
						actualiser votre déclaration et la déposer à nouveau sur le
						téléservice.
					</p>
				</>
			) : (
				<p>
					Êtes-vous sûr de vouloir supprimer la déclaration{" "}
					<strong>{declaration.name}</strong> ? Cette action est irréversible.
				</p>
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
						{isDeposited && (
							<>
								<Button
									priority="tertiary"
									size="small"
									linkProps={{
										href: publicHref,
										...newTabLinkProps(
											`Voir la déclaration ${declaration.name}`,
										),
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
											"Copier le lien web de la déclaration déposée",
									}}
									onClick={() =>
										copyToClipboard(
											`${process.env.NEXT_PUBLIC_FRONT_URL}${publicHref}`,
											() =>
												setNotice({
													severity: "success",
													description:
														"Lien de la déclaration déposée copié dans le presse-papier",
												}),
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
			{notice && (
				<div className={fr.cx("fr-container", "fr-mt-4v")}>
					<Alert
						small
						severity={notice.severity}
						description={notice.description}
						closable
						onClose={() => setNotice(null)}
					/>
				</div>
			)}
			<ConfirmationModal actions={confirmationModalActions} />
		</>
	);
}

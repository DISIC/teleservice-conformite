import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import {
	RevertModal,
	type RevertModalActions,
} from "~/components/modal/RevertModal";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	getDeclarationState,
	STATE_PRESENTATION,
} from "~/utils/declaration/state";
import { usePublishAttempt } from "~/utils/declaration/usePublishAttempt";

type StateNoticeProps = {
	declaration: PopulatedDeclaration;
	/** Arms the page-level error summary when a sequential publish surfaces errors. */
	onPublishAttempt: () => void;
	/** Re-fetch the page after a successful revert (re-runs SSR). */
	onReverted: () => void;
};

/**
 * Top-of-page status notice telling the declarant what to do next, plus its
 * action CTAs. A bespoke tss-styled card (not a DSFR `<Notice>`); content and
 * colours come from `STATE_PRESENTATION`, handlers are wired here per state.
 * Renders nothing for a clean published declaration (`getDeclarationState` →
 * `null`). See CONTEXT.md "Declaration state".
 */
export function StateNotice({
	declaration,
	onPublishAttempt,
	onReverted,
}: StateNoticeProps) {
	// `getDeclarationState` runs the full declaration validation; memoize so it
	// re-derives only when the declaration changes, not on every render.
	const state = useMemo(() => getDeclarationState(declaration), [declaration]);
	const { goToPreview, attemptPublish } = usePublishAttempt({
		declaration,
		onPublishAttempt,
	});
	const [revertActions] = useState<RevertModalActions>({});
	const { classes } = useStyles();

	if (!state) return null;

	const { bgColor, badge, heading, body, actions } = STATE_PRESENTATION[state];
	// `published-modified` is the only standalone state: always publishable, so
	// its publish CTA navigates straight to preview with no validation guard
	// (CONTEXT.md Invariants). Sequential states run the validation gate first.
	const onPublish =
		state === "published-modified" ? goToPreview : () => attemptPublish();

	return (
		<>
			<div
				className={classes.card}
				style={{ backgroundColor: bgColor }}
				aria-live="polite"
			>
				<div className={classes.content}>
					{badge && (
						<Badge
							noIcon
							small
							className={classes.badge}
							style={{ color: badge.color, backgroundColor: badge.bgColor }}
						>
							{badge.label}
						</Badge>
					)}
					<p className={fr.cx("fr-h6", "fr-mb-0")}>{heading}</p>
					<p className={classes.body}>{body}</p>
				</div>
				{actions.length > 0 && (
					<div className={classes.actions}>
						{actions.includes("revert") && (
							<Button
								priority="secondary"
								onClick={() => revertActions.open?.()}
							>
								Annuler les modifications
							</Button>
						)}
						{actions.includes("publish") && (
							<Button
								priority="primary"
								iconId="fr-icon-upload-fill"
								iconPosition="left"
								onClick={onPublish}
							>
								Prévisualiser et publier
							</Button>
						)}
					</div>
				)}
			</div>
			<RevertModal
				declarationId={declaration.id}
				actions={revertActions}
				onReverted={onReverted}
			/>
		</>
	);
}

const useStyles = tss.withName(StateNotice.name).create({
	card: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: fr.spacing("6v"),
		padding: fr.spacing("6v"),
	},
	content: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: fr.spacing("1v"),
	},
	badge: {
		marginBottom: fr.spacing("1v"),
	},
	body: {
		margin: 0,
	},
	actions: {
		display: "flex",
		flexWrap: "wrap",
		gap: fr.spacing("3v"),
		marginLeft: "auto",
	},
});

import {
	fr,
	type FrIconClassName,
	type RiIconClassName,
} from "@codegouvfr/react-dsfr";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useRouter } from "next/router";
import { useId, useRef, useState, type ReactNode } from "react";
import { tss } from "tss-react";
import { PathPicker } from "~/components/declaration/creation/PathPicker";
import { RequiredFieldsNotice } from "~/components/form/RequiredField";
import { useAccessibleModal } from "~/hooks/useAccessibleModal";

type Item = {
	title: string;
	description: ReactNode;
	icon: FrIconClassName | RiIconClassName;
};

const INTRO_COOKIE = "hideDeclarationIntro";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function isIntroHidden() {
	return document.cookie.split("; ").includes(`${INTRO_COOKIE}=true`);
}

function setIntroHidden(hidden: boolean) {
	const maxAge = hidden ? ONE_YEAR_IN_SECONDS : 0;
	document.cookie = `${INTRO_COOKIE}=true; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export type CreateDeclarationModalActions = {
	open?: () => void;
};

export function CreateDeclarationModal({
	actions,
}: {
	actions: CreateDeclarationModalActions;
}) {
	const id = useId();
	const { push } = useRouter();
	const { classes, cx } = useStyles();

	const [introModal] = useState(() =>
		createModal({
			id: `createDeclarationIntroModal-${id}`,
			isOpenedByDefault: false,
		}),
	);
	const [modal] = useState(() =>
		createModal({
			id: `createDeclarationModal-${id}`,
			isOpenedByDefault: false,
		}),
	);

	const openIntro = useAccessibleModal(introModal);
	const openCreate = useAccessibleModal(modal);
	const startRequested = useRef(false);
	const [hideIntro, setHideIntro] = useState(false);

	useIsModalOpen(introModal, {
		onConceal: () => {
			if (!startRequested.current) return;
			startRequested.current = false;
			openCreate();
		},
	});

	actions.open = () => (isIntroHidden() ? openCreate() : openIntro());

	const list: Item[] = [
		{
			title: "Une déclaration par service numérique et par support",
			description:
				"Par exemple, si vous avez un site, une application mobile iOs, une application mobile Android et un intranet, vous devrez déposer 4 déclarations.",
			icon: "ri-quill-pen-line",
		},
		{
			title: "Pour tous les services numériques, même sans audit",
			description: (
				<>
					Tous les sites et applications mobiles en production doivent être
					référencés sur le téléservice de déclaration,{" "}
					<strong>
						y compris ceux qui n’ont pas encore fait l’objet d’un audit
						d’accessibilité.
					</strong>
				</>
			),
			icon: "ri-list-check",
		},
		{
			title: "2 étapes simples",
			description: (
				<ol>
					<li>Vous déposez votre déclaration sur le téléservice.</li>
					<li>
						Vous publiez sur votre site le lien vers votre télédéclaration.
					</li>
				</ol>
			),
			icon: "ri-emoji-sticker-line",
		},
	];

	return (
		<>
			<introModal.Component
				size="large"
				title="Déposer une déclaration"
				buttons={[
					{
						children: "Commencer",
						priority: "primary",
						type: "button",
						onClick: () => {
							startRequested.current = true;
						},
					},
				]}
				className={classes.modal}
			>
				<ul className={classes.list}>
					{list.map(({ title, description, icon }) => (
						<li key={title} className={classes.item}>
							<span className={classes.iconBox}>
								<span className={cx(fr.cx(icon), classes.icon)} aria-hidden />
							</span>
							<div>
								<p className={fr.cx("fr-text--lg", "fr-mb-1v")}>
									<strong>{title}</strong>
								</p>
								<div className="fr-text--sm">{description}</div>
							</div>
						</li>
					))}
				</ul>
				<Checkbox
					className={cx(fr.cx("fr-mt-4v", "fr-mb-0"), classes.hideIntro)}
					options={[
						{
							label: "Ne plus afficher cette page",
							nativeInputProps: {
								checked: hideIntro,
								onChange: (event) => {
									setHideIntro(event.target.checked);
									setIntroHidden(event.target.checked);
								},
							},
						},
					]}
				/>
			</introModal.Component>
			<modal.Component size="large" title="Déposer une déclaration">
				<RequiredFieldsNotice />
				<PathPicker
					onCreated={(declarationId) =>
						push(`/dashboard/declarations/${declarationId}`)
					}
				/>
			</modal.Component>
		</>
	);
}

const useStyles = tss.withName(CreateDeclarationModal.name).create({
	hideIntro: {
		display: "flex",
		justifyContent: "flex-end",
		"& .fr-fieldset__element": {
			flex: "0 0 auto",
			marginBottom: 0,
		},
	},
	modal: {
		"& .fr-modal__header, & .fr-modal__content, & .fr-modal__footer": {
			paddingInline: fr.spacing("6w"),
		},
		"& .fr-modal__header": {
			paddingTop: fr.spacing("4w"),
		},
		"& .fr-modal__footer": {
			paddingBottom: fr.spacing("4w"),
			paddingTop: fr.spacing("3w"),
		},
		"& h1": {
			marginBottom: fr.spacing("10v"),
		},
	},
	list: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
	item: {
		display: "flex",
		alignItems: "flex-start",
		gap: fr.spacing("5v"),
		padding: 0,
	},
	iconBox: {
		flexShrink: 0,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: "78px",
		height: "78px",
		borderRadius: "50%",
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		"&::before, &::after": {
			"--icon-size": "33px",
		},
	},
	description: {
		"& ol": {
			margin: 0,
		},
	},
});

import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { tss } from "tss-react";
import { ErrorSummary } from "~/components/declaration/sections/ErrorSummary";
import { SideMenu } from "~/components/declaration/SideMenu";
import { DeclarationHeading } from "~/components/declaration/DeclarationHeading";
import { StateNotice } from "~/components/declaration/StateNotice";
import { ToCompleteGuidance } from "~/components/declaration/ToCompleteGuidance";
import { ObsolescenceInterstitial } from "~/components/declaration/ObsolescenceInterstitial";
import {
	getDeclarationStatus,
	getEditingMode,
} from "~/domain/declaration/status";
import { SectionContent } from "~/components/declaration/sections/Content";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { parseSectionFromQuery } from "~/domain/declaration/sections";
import { getObsolescence } from "~/domain/declaration/obsolescence";
import { validateDeclaration } from "~/domain/declaration/validate";
import {
	type DeclarationProps,
	guardDeclaration,
	type LibraryProps,
	type VisitProps,
} from "~/lib/server-guards";

export default function DeclarationPage({
	declaration: initialDeclaration,
	libraryContacts,
	librarySchemas,
	hasVisitedBefore,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const apiUtils = api.useUtils();
	// Seed the SSR-fetched Library lists into the query cache before the sections
	// render, so the source-mode radio knows Library availability at first paint.
	useState(() => {
		apiUtils.library.listContacts.setData(undefined, libraryContacts ?? []);
		apiUtils.library.listSchemas.setData(undefined, librarySchemas ?? []);
	});
	const { published, section: sectionQuery, field: fieldQuery } = router.query;
	const currentSection = parseSectionFromQuery(sectionQuery);
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertDetails, setAlertDetails] = useState<{
		title?: ReactNode;
		description?: ReactNode;
		severity: "info" | "success" | "warning" | "error";
		autoDismiss: boolean;
	}>({ title: "", description: "", severity: "info", autoDismiss: true });
	const { classes } = useStyles();

	const status = getDeclarationStatus(declaration);
	const editingMode = getEditingMode(status);
	// The first pass only exists in the walkthrough: outside it, missing data is
	// a regression to repair and is always flagged.
	const showToComplete = hasVisitedBefore || editingMode === "standalone";

	// The interstitial gates an unchanged, ageing publication until the declarant
	// starts updating it; once the row is Modifiée they are already acting.
	const obsolescence = getObsolescence(declaration, new Date());
	const [updateRevealed, setUpdateRevealed] = useState(false);
	const showInterstitial =
		obsolescence !== "valid" &&
		declaration.status !== "unpublished" &&
		!updateRevealed;

	// Armed by the terminal Section's "Prévisualiser et publier"; once armed, the
	// error summary re-derives from the declaration on every save.
	const [publishAttempted, setPublishAttempted] = useState(false);
	const declarationErrors = useMemo(
		() => (publishAttempted ? validateDeclaration(declaration) : []),
		[publishAttempted, declaration],
	);

	const showDeclarationAlert = ({
		title,
		description,
		severity,
		autoDismiss = true,
	}: {
		title?: ReactNode;
		description?: ReactNode;
		severity: "info" | "success" | "warning" | "error";
		autoDismiss?: boolean;
	}) => {
		setAlertDetails({ title, description, severity, autoDismiss });
		setShowAlert(true);
	};

	useEffect(() => {
		if (!showAlert || !alertDetails.autoDismiss) return;

		const timer = setTimeout(() => {
			setShowAlert(false);
		}, 5000);

		return () => clearTimeout(timer);
	}, [showAlert, alertDetails]);

	// Focus the errored field on first mount, then drop the param so it neither
	// lingers in the URL nor re-fires on later re-renders.
	useEffect(() => {
		if (typeof fieldQuery !== "string") return;

		const input = document.querySelector<HTMLElement>(`[name="${fieldQuery}"]`);
		if (input) {
			input.focus({ preventScroll: true });
			input.scrollIntoView({ behavior: "smooth", block: "center" });
		}

		const { field: _field, ...query } = router.query;
		router.replace({ query }, undefined, { shallow: true, scroll: false });
	}, [fieldQuery, currentSection, router]);

	useEffect(() => {
		if (published === "true") {
			showDeclarationAlert({
				title: "Votre déclaration est en ligne.",
				description: (
					<a
						href={`/declarations/${declaration.id}/publish`}
						target="_blank"
						rel="noopener noreferrer"
						title={`Voir la déclaration ${declaration.name}, nouvelle fenêtre`}
					>
						Voir la déclaration
					</a>
				),
				severity: "success",
				autoDismiss: false,
			});

			router.replace(`/dashboard/declarations/${declaration.id}`, undefined, {
				shallow: true,
			});
		}
	}, [published]);

	const heading = (
		<>
			<Head>
				<title>
					Déclaration de {declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<DeclarationHeading declaration={declaration} />
		</>
	);

	if (showInterstitial) {
		return (
			<>
				{heading}
				<section
					id="declaration-page"
					className={fr.cx("fr-container", "fr-mt-10v")}
				>
					<ObsolescenceInterstitial
						declaration={declaration}
						obsolescence={obsolescence}
						onUpdate={() => setUpdateRevealed(true)}
					/>
				</section>
			</>
		);
	}

	return (
		<>
			{heading}
			<section
				id="declaration-page"
				className={fr.cx("fr-container", "fr-mt-10v")}
			>
				<ToCompleteGuidance show={showToComplete}>
					{showAlert && (
						<div className={classes.alertWrapper}>
							<Alert
								small
								severity={alertDetails.severity}
								title={alertDetails?.title ?? ""}
								description={alertDetails?.description ?? ""}
								closable
								isClosed={!showAlert}
								onClose={() => setShowAlert(false)}
							/>
						</div>
					)}
					<StateNotice
						declaration={declaration}
						onPublishAttempt={() => setPublishAttempted(true)}
						onReverted={() => router.reload()}
					/>

					<div className={classes.tabContent}>
						{declarationErrors.length > 0 && (
							<div className={classes.errorSummaryWrapper}>
								<ErrorSummary
									declarationId={declaration.id}
									errors={declarationErrors}
								/>
							</div>
						)}
						<div
							className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}
							role="presentation"
						>
							<aside className={fr.cx("fr-col-12", "fr-col-md-4")}>
								<SideMenu
									declaration={declaration}
									currentSection={currentSection}
								/>
							</aside>
							<div className={fr.cx("fr-col-12", "fr-col-md-8")}>
								<SectionContent
									declaration={declaration}
									currentSection={currentSection}
									onDeclarationChange={setDeclaration}
									mode={editingMode}
									onPublishAttempt={() => setPublishAttempted(true)}
								/>
							</div>
						</div>
					</div>
				</ToCompleteGuidance>
			</section>
		</>
	);
}

const useStyles = tss.withName(DeclarationPage.name).create({
	errorSummaryWrapper: {
		marginBottom: fr.spacing("6v"),
	},
	aiBannerWrapper: {
		marginBottom: fr.spacing("6v"),
	},
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
	tabContent: {
		paddingTop: fr.spacing("6v"),
		paddingBottom: fr.spacing("16v"),
	},
	alertWrapper: {
		width: "100%",
		display: "flex",
		marginBottom: fr.spacing("6v"),
		"& div": {
			width: "100%",
		},
	},
});

export const getServerSideProps = (async (context) =>
	guardDeclaration(context, {
		includeLibrary: true,
		trackVisit: true,
	})) satisfies GetServerSideProps<
	DeclarationProps & Partial<LibraryProps> & Partial<VisitProps>
>;

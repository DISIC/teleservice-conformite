import { fr } from "@codegouvfr/react-dsfr";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header, type HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { tss } from "tss-react";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";

import { AlertHost } from "~/components/alert/AlertHost";
import "~/styles/keyframes.css";
import { api } from "~/utils/api";
import { authClient } from "~/utils/auth-client";

// Only in TypeScript projects
declare module "@codegouvfr/react-dsfr/next-pagesdir" {
	interface RegisterLink {
		Link: typeof Link;
	}
}

const { augmentDocumentWithEmotionCache, withAppEmotionCache } =
	createEmotionSsrAdvancedApproach({ key: "css" });

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
	defaultColorScheme: "system",
	Link,
	preloadFonts: [
		//"Marianne-Light",
		//"Marianne-Light_Italic",
		"Marianne-Regular",
		//"Marianne-Regular_Italic",
		"Marianne-Medium",
		//"Marianne-Medium_Italic",
		"Marianne-Bold",
		//"Marianne-Bold_Italic",
		//"Spectral-Regular",
		//"Spectral-ExtraBold"
	],
});

export { augmentDocumentWithEmotionCache, dsfrDocumentApi };

const getBackgroundColor = (pathname: string) => {
	const page = pathname.split("/").pop() || "";

	if (["infos", "audit", "schema", "contact", "form"].includes(page)) {
		return fr.colors.decisions.background.alt.blueFrance.default;
	}

	if (["preview"].includes(page)) {
		return fr.colors.decisions.background.alt.blueFrance.default;
	}

	return "inherit";
};

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const { classes } = useStyles({
		backgroundColor: getBackgroundColor(router.pathname),
	});
	const { data: authSession, isPending: isPendingAuth } =
		authClient.useSession();
	const isAuthenticated = !!authSession;

	const getTitleFromPathname = (pathname: string): string | undefined => {
		if (pathname === "/dashboard") return "Liste des déclarations";

		if (pathname === "/dashboard/form") return "Ajouter une déclaration";
	};

	const quickAccessItems = useMemo(() => {
		const items = [] as HeaderProps.QuickAccessItem[];

		if (isPendingAuth) return [];

		if (isAuthenticated) {
			items.push(
				{
					iconId: "ri-account-circle-fill",
					text: "Paramètres / Compte",
					linkProps: {
						href: "/dashboard",
					},
				},
				{
					iconId: "ri-menu-2-line",
					text: "Déconnexion",
					buttonProps: {
						onClick: async () => {
							await authClient.signOut({
								fetchOptions: { onSuccess: () => router.reload() },
							});
						},
					},
				},
			);
		}

		return items;
	}, [authSession?.session, authSession?.user, isAuthenticated, isPendingAuth]);

	return (
		<>
			<Head>
				<title>
					{`${
						getTitleFromPathname(router.pathname)
							? `${getTitleFromPathname(router.pathname)} - `
							: ""
					}Téléservice Conformité`}
				</title>
			</Head>
			<div className={classes.mainContainer}>
				{" "}
				<SkipLinks
					links={[
						{
							anchor: "#contenu",
							label: "Contenu",
						},
						{
							anchor: "#footer",
							label: "Pied de page",
						},
					]}
				/>
				<Header
					brandTop={
						<>
							RÉPUBLIQUE
							<br />
							FRANÇAISE
						</>
					}
					homeLinkProps={{
						href: "/",
						title: "Accueil Téléservice Conformité",
					}}
					quickAccessItems={quickAccessItems}
					serviceTitle="Téléservice Conformité"
				/>
				<main id="contenu" className={classes.main} style={{ flex: 1 }}>
					<AlertHost />
					<Component {...pageProps} />
				</main>
				<Footer
					id="footer"
					accessibility="non compliant"
					bottomItems={[headerFooterDisplayItem]}
				/>
			</div>
		</>
	);
}

export const useStyles = tss
	.withName(App.name)
	.withParams<{
		backgroundColor?: string;
	}>()
	.create(({ backgroundColor = "inherit" }) => ({
		mainContainer: {
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
		},
		main: {
			backgroundColor: backgroundColor,
			display: "flex",
			width: "100%",
			flexDirection: "column",
		},
		formContainer: {
			boxSizing: "border-box",
			paddingInline: fr.spacing("4v"),
			paddingBlock: fr.spacing("12v"),
			width: "100%",
			height: "100%",

			"@media (min-width: 1024px)": {
				paddingInline: "16rem",
			},
		},
	}));

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));

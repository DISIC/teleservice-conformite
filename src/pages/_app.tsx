import { fr } from "@codegouvfr/react-dsfr";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header, type HeaderProps } from "@codegouvfr/react-dsfr/Header";
import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";
import { tss } from "tss-react";

import { api } from "~/utils/api";
import { authClient } from "~/utils/auth-client";
import { AlertHost } from "~/components/alert/AlertHost";

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

const userNavigationItems: MainNavigationProps.Item[] = [
	{ text: "Accueil", linkProps: { href: "/dashboard" } },
	{ text: "Test - Ara", linkProps: { href: "/dashboard/ara" } },
	{ text: "Test - Déclaration", linkProps: { href: "/dashboard/declaration" } },
];

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const { classes, cx } = useStyles({
		isFormPage: ["infos", "audit", "schema", "contact", "form"].includes(
			router.pathname.split("/").pop() || "",
		),
	});
	const { data: authSession, isPending: isPendingAuth } =
		authClient.useSession();
	const isAuthenticated = !!authSession;

	const navigationItems =
		isAuthenticated || router.pathname.startsWith("/dashboard")
			? userNavigationItems.map((item) => ({
					...item,
					isActive: router.asPath === item?.linkProps?.href,
				}))
			: [];

	const quickAccessItems = useMemo(() => {
		const items = [] as HeaderProps.QuickAccessItem[];

		if (isPendingAuth) return [];

		if (isAuthenticated) {
			items.push({
				iconId: "ri-logout-box-line",
				text: "Se déconnecter",
				buttonProps: {
					onClick: async () => {
						await authClient.signOut({
							fetchOptions: { onSuccess: () => void router.push("/") },
						});
					},
					style: { color: fr.colors.decisions.text.default.error.default },
				},
			});
		}

		return items;
	}, [authSession?.session, authSession?.user, isAuthenticated, isPendingAuth]);

	return (
		<>
			<Head>
				<title>Téléservice Conformité</title>
			</Head>
			<div className={classes.mainContainer}>
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
					// navigation={navigationItems}
					quickAccessItems={quickAccessItems}
					serviceTitle="Téléservice Conformité"
					className={classes.header}
				/>
				<main className={classes.main} style={{ flex: 1 }}>
					<AlertHost />
					<Component {...pageProps} />
				</main>
				<Footer
					accessibility="non compliant"
					bottomItems={[headerFooterDisplayItem]}
					className={classes.footer}
				/>
			</div>
		</>
	);
}

const useStyles = tss
	.withName(App.name)
	.withParams<{
		isFormPage: boolean;
	}>()
	.create(({ isFormPage }) => ({
		header: {
			"& > #header-menu-modal-fr-header": {
				display: "none",
			},
			"& > div": {
				marginInline: "16rem",
				"& > div": {
					paddingInline: 0,
					marginInline: 0,
					maxWidth: "none",
					width: "100%",
				},
			},
		},
		footer: {
			"& > div": {
				marginInline: 0,
				width: "100%",
				maxWidth: "none",
				boxSizing: "border-box",
				paddingInline: "16rem",
			},
		},
		mainContainer: {
			minHeight: "100vh",
			display: "flex",
			flexDirection: "column",
		},
		main: {
			backgroundColor: isFormPage
				? fr.colors.decisions.background.alt.blueFrance.default
				: "inherit",
		},
	}));

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));

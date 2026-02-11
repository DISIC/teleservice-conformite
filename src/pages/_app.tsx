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
import { tss } from "tss-react";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";

import { AlertHost } from "~/components/alert/AlertHost";
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

const userNavigationItems: MainNavigationProps.Item[] = [
	{ text: "Accueil", linkProps: { href: "/dashboard" } },
	{ text: "Test - Ara", linkProps: { href: "/dashboard/ara" } },
	{ text: "Test - Déclaration", linkProps: { href: "/dashboard/declaration" } },
];

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
	const { classes, cx } = useStyles({
		backgroundColor: getBackgroundColor(router.pathname),
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
				/>
				<main className={classes.main} style={{ flex: 1 }}>
					<AlertHost />
					<Component {...pageProps} />
				</main>
				<Footer
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
		},
		formContainer: {
			paddingInline: "16rem",
			paddingBlock: fr.spacing("12v"),
		},
	}));

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));

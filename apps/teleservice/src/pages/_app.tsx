import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header, type HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import NextApp, { type AppContext, type AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { tss } from "tss-react";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";

import { AlertHost } from "~/components/alert/AlertHost";
import type { PageWithHeader } from "~/components/layout/pageHeader";
import "~/styles/keyframes.css";
import { api } from "~/lib/api";
import { authClient, signInWithProConnect } from "~/lib/auth-client";

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
	preloadFonts: ["Marianne-Regular", "Marianne-Medium", "Marianne-Bold"],
});

export { augmentDocumentWithEmotionCache, dsfrDocumentApi };

const NAVIGATION = [
	{ text: "Mes déclarations", href: "/dashboard/declarations" },
	{ text: "Mes contacts", href: "/dashboard/contacts" },
	{ text: "Mes schémas", href: "/dashboard/schemas" },
	{
		text: "Toutes les déclarations de l’organisation",
		href: "/dashboard/organisation",
	},
];

// better-auth's session cookie is httpOnly: only the server can tell, before the
// client session resolves, whether to render the authenticated header.
const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/;

const getActiveHref = (pathname: string) =>
	NAVIGATION.map((item) => item.href)
		.filter((href) => pathname === href || pathname.startsWith(`${href}/`))
		.sort((a, b) => b.length - a.length)[0];

function App({ Component, pageProps: allPageProps }: AppProps) {
	const { hasSessionCookie, ...pageProps } = allPageProps as {
		hasSessionCookie?: boolean;
	};
	const router = useRouter();
	const { classes } = useStyles();
	const { data: authSession, isPending: isPendingAuth } =
		authClient.useSession();
	const isAuthenticated = isPendingAuth ? !!hasSessionCookie : !!authSession;

	const quickAccessItems = useMemo<HeaderProps.QuickAccessItem[]>(() => {
		if (!isAuthenticated) {
			return [
				{
					iconId: "fr-icon-account-line",
					text: "Se connecter",
					buttonProps: {
						onClick: () => signInWithProConnect(),
						className: fr.cx("fr-btn--tertiary"),
					},
				},
			];
		}

		return [
			{
				iconId: "fr-icon-logout-box-r-line",
				text: "Déconnexion",
				buttonProps: {
					priority: "tertiary",
					onClick: async () => {
						await authClient.signOut({
							fetchOptions: { onSuccess: () => router.reload() },
						});
					},
					className: fr.cx("fr-btn--tertiary"),
				},
			},
		];
	}, [isAuthenticated]);

	const activeHref = getActiveHref(router.pathname);
	const navigation = useMemo(
		() =>
			isAuthenticated
				? NAVIGATION.map((item) => ({
						text: item.text,
						isActive: item.href === activeHref,
						linkProps: { href: item.href },
					}))
				: undefined,
		[isAuthenticated, activeHref],
	);

	const pageHeader = (
		Component as PageWithHeader<typeof pageProps>
	).renderHeader?.(pageProps);

	return (
		<>
			<Head>
				<title>Téléservice Conformité</title>
			</Head>
			<div className={classes.mainContainer}>
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
				{pageHeader ?? (
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
						navigation={navigation}
						serviceTitle={
							<>
								Téléservice de déclaration d’accessibilité numérique{" "}
								<Badge as="span" noIcon small severity="info">
									BETA
								</Badge>
							</>
						}
						serviceTagline="Publiez et centralisez vos déclarations d’accessibilité conformément aux exigences légales."
					/>
				)}
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

App.getInitialProps = async (appContext: AppContext) => {
	const initialProps = await NextApp.getInitialProps(appContext);
	const cookie = appContext.ctx.req?.headers.cookie;
	if (cookie === undefined) return initialProps;
	return {
		...initialProps,
		pageProps: {
			...initialProps.pageProps,
			hasSessionCookie: SESSION_COOKIE.test(cookie),
		},
	};
};

const useStyles = tss.withName(App.name).create({
	mainContainer: {
		minHeight: "100vh",
		display: "flex",
		flexDirection: "column",
	},
	main: {
		display: "flex",
		width: "100%",
		flexDirection: "column",
	},
});

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));

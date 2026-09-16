import Badge from "@codegouvfr/react-dsfr/Badge";
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
import type { PageWithHeader } from "~/components/layout/pageHeader";
import "~/styles/keyframes.css";
import { api } from "~/lib/api";
import { authClient } from "~/lib/auth-client";

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

const getActiveHref = (pathname: string) =>
	NAVIGATION.map((item) => item.href)
		.filter((href) => pathname === href || pathname.startsWith(`${href}/`))
		.sort((a, b) => b.length - a.length)[0];

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const { classes } = useStyles();
	const { data: authSession, isPending: isPendingAuth } =
		authClient.useSession();
	const isAuthenticated = !isPendingAuth && !!authSession;

	const quickAccessItems = useMemo<HeaderProps.QuickAccessItem[]>(() => {
		if (!isAuthenticated) return [];

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
						serviceTagline="Centralisez et gérez vos déclarations d’accessibilité conformément aux exigences légales."
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

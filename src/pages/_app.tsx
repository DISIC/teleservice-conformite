import { fr } from "@codegouvfr/react-dsfr";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { Header, type HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { createEmotionSsrAdvancedApproach } from "tss-react/next/pagesDir";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import Head from "next/head";
import { authClient } from "~/utils/auth-client";
import { useMemo } from "react";

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
];

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
          navigation={navigationItems}
          quickAccessItems={quickAccessItems}
          serviceTitle="Téléservice Conformité"
        />
        <main className={fr.cx("fr-container")} style={{ flex: 1 }}>
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

export default withDsfr(api.withTRPC(withAppEmotionCache(App)));

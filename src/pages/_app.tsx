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

const navigationItems: MainNavigationProps.Item[] = [
  { text: "Accueil", linkProps: { href: "/" } },
];

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const logout = async () => {
    router.push("/");
  };

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

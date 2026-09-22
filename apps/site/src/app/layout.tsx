import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EmotionCacheProvider } from "~/components/EmotionCacheProvider";
import RgaaHeader from "~/components/rgaa/RgaaHeader";
import { readVersionedMarkdown, splitSections } from "~/lib/content";
import { DsfrProvider } from "~/dsfr-bootstrap";
import {
	DsfrHead,
	getHtmlAttributes,
} from "~/dsfr-bootstrap/server-only-index";

export const metadata: Metadata = {
	title: { default: "RGAA 5", template: "RGAA 5 - %s" },
	description:
		"Référentiel général d’amélioration de l’accessibilité, version 5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	const lang = "fr";
	const releaseNotes = splitSections(
		readVersionedMarkdown("notes-de-version"),
	).map(({ id, label }) => ({ text: label, href: `/notes#${id}` }));

	return (
		<html lang={lang} {...getHtmlAttributes({ lang })}>
			<head>
				<DsfrHead
					preloadFonts={[
						"Marianne-Regular",
						"Marianne-Medium",
						"Marianne-Bold",
					]}
				/>
			</head>
			<body
				style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
			>
				<EmotionCacheProvider>
					<DsfrProvider lang={lang}>
						<SkipLinks
							links={[
								{ anchor: "#contenu", label: "Contenu" },
								{ anchor: "#footer", label: "Pied de page" },
							]}
						/>
						<RgaaHeader releaseNotes={releaseNotes} />
						<main id="contenu" style={{ flex: 1 }}>
							{children}
						</main>
						<Footer
							id="footer"
							brandTop={
								<>
									RÉPUBLIQUE
									<br />
									FRANÇAISE
								</>
							}
							homeLinkProps={{ href: "/", title: "Accueil - RGAA 5" }}
							accessibility="non compliant"
							bottomItems={[headerFooterDisplayItem]}
						/>
					</DsfrProvider>
				</EmotionCacheProvider>
			</body>
		</html>
	);
}

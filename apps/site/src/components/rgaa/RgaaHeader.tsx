"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { Header } from "@codegouvfr/react-dsfr/Header";
import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { usePathname } from "next/navigation";
import type { NavEntry } from "~/lib/navigation";

const TELESERVICE_URL = process.env.NEXT_PUBLIC_TELESERVICE_URL ?? "/";
const RGAA4_URL = "https://accessibilite.numerique.gouv.fr";

const entryHrefs = (entry: NavEntry): string[] =>
	"links" in entry ? entry.links.map((link) => link.href) : [entry.href];

const normalize = (pathname: string) =>
	pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

// TODO: add link
const getActiveHref = (navigation: NavEntry[], pathname: string) =>
	navigation
		.flatMap(entryHrefs)
		.filter(
			(href) =>
				pathname === href || (href !== "#" && pathname.startsWith(`${href}/`)),
		)
		.sort((a, b) => b.length - a.length)[0] ?? "";

interface RgaaHeaderProps {
	navigation: NavEntry[];
}

export default function RgaaHeader({ navigation: entries }: RgaaHeaderProps) {
	const activeHref = getActiveHref(entries, normalize(usePathname()));

	const navigation: MainNavigationProps.Item[] = entries.map((entry) =>
		"links" in entry
			? {
					text: entry.text,
					isActive: entryHrefs(entry).includes(activeHref),
					menuLinks: entry.links.map((link) => ({
						text: link.text,
						linkProps: { href: link.href },
						isActive: link.href === activeHref,
					})),
				}
			: {
					text: entry.text,
					isActive: entry.href === activeHref,
					linkProps: { href: entry.href },
				},
	);

	return (
		<>
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
					title: "Accueil - RGAA 5",
				}}
				quickAccessItems={[
					<Button
						key="publish-declaration"
						iconId="ri-share-box-line"
						iconPosition="right"
						linkProps={{ href: TELESERVICE_URL }}
						priority="tertiary"
					>
						Publier une déclaration
					</Button>,
					<Button
						key="rgaa-4"
						iconId="ri-share-box-line"
						iconPosition="right"
						linkProps={{ href: RGAA4_URL }}
						priority="tertiary"
					>
						RGAA4 - Version en vigueur
					</Button>,
				]}
				navigation={navigation}
				serviceTitle={
					<>
						RGAA - Version 5{" "}
						<Badge as="span" noIcon small severity="info">
							BETA
						</Badge>
					</>
				}
				serviceTagline="Référentiel général d’amélioration de l’accessibilité"
			/>
			<Notice
				title="Version bêta"
				description="La version 5 du RGAA n’est pas encore encore applicable."
				severity="info"
				link={{
					linkProps: { href: RGAA4_URL },
					text: "Voir la version en vigueur",
				}}
			/>
		</>
	);
}

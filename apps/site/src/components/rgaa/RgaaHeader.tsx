"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { Header } from "@codegouvfr/react-dsfr/Header";
import type { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { usePathname } from "next/navigation";
import { tss } from "tss-react";

// The two spaces live on two hosts; the switch button is a plain link between them.
const TELESERVICE_URL = process.env.NEXT_PUBLIC_TELESERVICE_URL ?? "/";
const RGAA4_URL = "https://accessibilite.numerique.gouv.fr";

type NavLink = { text: string; href: string };
type NavCategory = {
	categoryMainLink: { text: string; href?: string };
	links: NavLink[];
};
type NavLeader = { title: string; paragraph?: string; link?: NavLink };

type NavEntry =
	| NavLink
	| { text: string; links: NavLink[] }
	| { text: string; categories: NavCategory[]; leader?: NavLeader };

const NAVIGATION: NavEntry[] = [
	{ text: "Accueil", href: "/" },
	{ text: "Obligations légales", href: "/obligations" },
	{
		text: "Méthode technique",
		leader: {
			title: "Méthode technique",
			paragraph:
				"La version 5 du RGAA n’est pas encore applicable. Vous pouvez lorem ipsum dolor sit amet",
			link: {
				text: "RGAA4 - Version en vigueur",
				href: RGAA4_URL,
			},
		},
		categories: [
			{
				categoryMainLink: {
					text: "Critères et tests",
					href: "/methode",
				},
				links: [
					{ text: "Référentiel web", href: "/rgaa/web" },
					{ text: "Référentiel bureautique", href: "/rgaa/bureautique" },
					{ text: "Référentiel application mobile", href: "/rgaa/mobile" },
				],
			},
		],
	},
	{
		text: "Ressources",
		leader: {
			title: "Ressources",
		},
		categories: [
			{
				categoryMainLink: {
					text: "Documentation",
				},
				links: [
					{ text: "Référentiel web", href: "/" },
					{ text: "Référentiel bureautique", href: "/" },
					{ text: "Référentiel application mobile", href: "/" },
				],
			},
			{
				categoryMainLink: {
					text: "Outils",
				},
				links: [
					{ text: "Ara - Outil d’audit d’accessibilité", href: "/" },
					{ text: "Kit d’audit", href: "/" },
				],
			},
			{
				categoryMainLink: {
					text: "Notes de version",
				},
				links: [
					{ text: "Note de version du RGAA 5", href: "/" },
					{ text: "Note de version du RGAA 4.12", href: "/" },
					{ text: "Notes de révision du RGAA 4.1", href: "/" },
				],
			},
		],
	},
];

const entryHrefs = (entry: NavEntry): string[] =>
	"href" in entry
		? [entry.href]
		: "categories" in entry
			? entry.categories.flatMap((category) => [
					...(category.categoryMainLink.href
						? [category.categoryMainLink.href]
						: []),
					...category.links.map((link) => link.href),
				])
			: entry.links.map((link) => link.href);

const normalize = (pathname: string) =>
	pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

const getActiveHref = (pathname: string) =>
	NAVIGATION.flatMap(entryHrefs)
		.filter(
			(href) =>
				pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)),
		)
		.sort((a, b) => b.length - a.length)[0] ?? "";

export default function RgaaHeader() {
	const { classes } = useStyles();
	const pathname = normalize(usePathname());
	const activeHref = getActiveHref(pathname);

	const navigation: MainNavigationProps.Item[] = NAVIGATION.map((entry) => {
		if ("href" in entry) {
			return {
				text: entry.text,
				isActive: entry.href === activeHref,
				linkProps: { href: entry.href },
			};
		}

		if ("categories" in entry) {
			return {
				text: entry.text,
				isActive: entryHrefs(entry).includes(activeHref),
				megaMenu: {
					leader: entry.leader
						? {
								title: entry.leader.title,
								paragraph: entry.leader.paragraph,
								...(entry.leader.link
									? {
											link: {
												text: entry.leader.link.text,
												linkProps: { href: entry.leader.link.href },
											},
										}
									: {}),
							}
						: undefined,
					categories: entry.categories.map((category) => ({
						...(category.categoryMainLink.href
							? {
									categoryMainLink: {
										text: category.categoryMainLink.text,
										linkProps: { href: category.categoryMainLink.href },
									},
								}
							: { categoryMainText: category.categoryMainLink.text }),
						links: category.links.map((link) => ({
							text: link.text,
							linkProps: { href: link.href },
							isActive: link.href === activeHref,
						})),
					})),
				},
			};
		}

		return {
			text: entry.text,
			isActive: entry.links.some((link) => link.href === activeHref),
			menuLinks: entry.links.map((link) => ({
				text: link.text,
				linkProps: { href: link.href },
				isActive: link.href === activeHref,
			})),
		};
	});

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
				className={classes.main}
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

const useStyles = tss.withName(RgaaHeader.name).create({
	main: {
		"h5.fr-mega-menu__category.fr-nav__link": {
			fontWeight: "bold !important",
		},
		"h5.fr-mega-menu__category > a.fr-nav__link": {
			fontSize: "1.25rem",
		},
	},
});

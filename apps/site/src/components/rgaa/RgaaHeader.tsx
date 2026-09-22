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

const buildNavigation = (releaseNotes: NavLink[]): NavEntry[] => [
	// TODO: add link
	{ text: "Accueil", href: "/" },
	{ text: "Obligations légales", href: "/obligations" },
	{
		text: "Méthode technique",
		links: [
			{ text: "Introduction", href: "/methode" },
			{ text: "Référentiel web", href: "/rgaa/web" },
			{ text: "Référentiel bureautique", href: "/rgaa/bureautique" },
			{ text: "Référentiel application mobile", href: "/rgaa/mobile" },
		],
	},
	{
		text: "Ressources",
		links: [
			{ text: "Documents de référence", href: "#" },
			{ text: "Critères AAA", href: "#" },
			{ text: "Ara - Outil d’audit d’accessibilité", href: "/ara" },
			{ text: "Modèles à télécharger", href: "/modeles" },
			{ text: "Note de révision du RGAA 4.12 vers le RGAA 5", href: "/notes" },
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
	// Read from the markdown release notes at build time; the header cannot touch the filesystem.
	releaseNotes: NavLink[];
}

export default function RgaaHeader({ releaseNotes }: RgaaHeaderProps) {
	const { classes } = useStyles();
	const pathname = normalize(usePathname());
	const entries = buildNavigation(releaseNotes);
	const activeHref = getActiveHref(entries, pathname);

	const navigation: MainNavigationProps.Item[] = entries.map((entry) => {
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
	main: {},
});

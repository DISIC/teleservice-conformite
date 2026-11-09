import * as z from "zod";
import { ReferentielId } from "./published";

const NumeroThematique = z
	.union([z.int().positive(), z.string().regex(/^[1-9]\d*$/)])
	.transform(String);

export const ThematiquesFile = z.array(
	z.strictObject({
		number: NumeroThematique,
		title: z.string().trim().min(1),
	}),
);

// Unquoted, 1.10 reads as the number 1.1: numbers are strings in the sources.
const NumeroReference = z.string({
	error: 'doit être une chaîne : entourez le numéro de guillemets (« "1.10" »)',
});

export const TECHNIQUE_PREFIXES = [
	"ARIA",
	"C",
	"F",
	"G",
	"H",
	"SCR",
	"SM",
	"SVR",
] as const;
export type TechniquePrefix = (typeof TECHNIQUE_PREFIXES)[number];

const Technique = z
	.string()
	.trim()
	.regex(new RegExp(`^(${TECHNIQUE_PREFIXES.join("|")})[1-9]\\d*$`), {
		error: `technique WCAG inconnue : préfixe attendu parmi ${TECHNIQUE_PREFIXES.join(", ")}, suivi d'un numéro (« H36 »)`,
	});

export const AnnexeFrontmatter = z.strictObject({
	references: z
		.array(
			z.strictObject({
				reference: NumeroReference.trim().min(1),
				title: z.string().trim().min(1),
				level: z.enum(["A", "AA", "AAA"]).optional(),
			}),
		)
		.min(1)
		.optional(),
	techniques: z.array(Technique).min(1).optional(),
});
export type Annexe = z.infer<typeof AnnexeFrontmatter>;

export const TestFrontmatter = z.strictObject({
	title: z.string().trim().min(1),
	conditions: z.array(z.string().trim().min(1)).min(1).optional(),
});

export const TermeFrontmatter = z.strictObject({
	title: z.string().trim().min(1),
	referentiels: z.array(ReferentielId).min(1).optional(),
});

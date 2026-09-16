import * as z from "zod";

export const REFERENTIEL_IDS = ["web", "mobile", "bureautique"] as const;
export const ReferentielId = z.enum(REFERENTIEL_IDS);
export type ReferentielId = z.infer<typeof ReferentielId>;

export const REFERENTIEL_TITLES: Record<ReferentielId, string> = {
	web: "Sites web",
	mobile: "Applications mobiles",
	bureautique: "Logiciels bureautiques",
};

export const Reference = z.object({
	standard: z.string().min(1),
	reference: z.string().min(1),
	title: z.string().min(1),
	level: z.enum(["A", "AA", "AAA"]).optional(),
});
export type Reference = z.infer<typeof Reference>;

export const Appendix = z.object({
	references: z.array(Reference).min(1).optional(),
	techniques: z.array(z.string().min(1)).min(1).optional(),
	particularCases: z.string().min(1).optional(),
	technicalNotes: z.string().min(1).optional(),
});
export type Appendix = z.infer<typeof Appendix>;

export const Test = z.object({
	number: z.string().regex(/^\d+\.\d+\.\d+$/),
	title: z.string().min(1),
	conditions: z.array(z.string().min(1)).min(1).optional(),
	methodology: z.string().min(1),
});
export type Test = z.infer<typeof Test>;

export const Declinaison = z.object({
	tests: z.array(Test).min(1),
	appendix: Appendix.optional(),
});
export type Declinaison = z.infer<typeof Declinaison>;

// A missing Référentiel key is what "Non applicable" means; there is no applicability flag.
export const Critere = z.object({
	number: z.string().regex(/^\d+\.\d+$/),
	title: z.string().min(1),
	referentiels: z.partialRecord(ReferentielId, Declinaison),
});
export type Critere = z.infer<typeof Critere>;

export const Thematique = z.object({
	number: z.string().regex(/^\d+$/),
	title: z.string().min(1),
	criteria: z.array(Critere),
});
export type Thematique = z.infer<typeof Thematique>;

export const Terme = z.object({
	slug: z.string().min(1),
	title: z.string().min(1),
	referentiels: z.array(ReferentielId).min(1),
	definition: z.string().min(1),
});
export type Terme = z.infer<typeof Terme>;

const Header = z.object({
	$schema: z.string().optional(),
	rgaa: z.object({ version: z.string().min(1), date: z.string().optional() }),
	source: z.string().optional(),
});

export const CriteresFile = Header.extend({
	urls: z.object({ criterion: z.string(), test: z.string(), term: z.string() }),
	referentiels: z.array(
		z.object({ id: ReferentielId, title: z.string().min(1) }),
	),
	topics: z.array(Thematique),
});
export type CriteresFile = z.infer<typeof CriteresFile>;

export const GlossaireFile = Header.extend({
	terms: z.array(Terme),
});
export type GlossaireFile = z.infer<typeof GlossaireFile>;

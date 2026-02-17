export const sourceOptions = [
  { label: "manuel/défaut", value: "default" },
  { label: "IA", value: "fromAI" },
  { label: "Ara", value: "fromAra" },
] as const;

export const auditStatusOptions = [...sourceOptions, { label: "pas realisé", value: "notRealised" }] as const;

export const rgaaVersionOptions = [
  {
    label: "RGAA 4",
    value: "rgaa_4",
  },
  {
    label: "RGAA 5",
    value: "rgaa_5",
  },
] as const;

export const toolOptions = [
  { label: "Wave", value: "wave" },
  { label: "NVDA", value: "nvda" },
  { label: "Web Developer Toolbar", value: "web_developer_toolbar" },
  { label: "HeadingsMap", value: "headings_map" },
  { label: "JAWS", value: "jaws" },
  { label: "Assistant RGAA", value: "assistant_rgaa" },
  { label: "Tanaguru", value: "tanaguru" },
] as const;

export const testEnvironmentOptions = [
  { label: "NVDA (Firefox)", value: "nvda_firefox" },
  { label: "JAWS (Firefox)", value: "jaws_firefox" },
  { label: "VoiceOver (Safari)", value: "voiceover_safari" },
  { label: "ZoomText (Windows ou Mac OSX)", value: "zoomtext_windows_mac" },
  { label: "Dragon Naturally Speaking (Windows ou Mac OSX)", value: "dragon_naturally_speaking_windows_mac" },
] as const;

export const contactMeanOptions = [
  {
    label: "Formulaire en ligne",
    value: "form_url",
  },
  {
    label: "Point de contact",
    value: "email",
  },
] as const;

export const appKindOptions = [
  {
    label: "Site web",
    value: "website",
		description: "Site internet, intranet, extranet, application métier, ...",
  },
  {
    label: "Application mobile iOs",
    value: "mobile_app_ios",
  },
  {
    label: "Application mobile Android",
    value: "mobile_app_android",
  },
  {
    label: "Autre",
    value: "other",
  },
] as const;

export const declarationStatusOptions = [
	{
		label: "Publié",
		value: "published",
	},

	{
		label: "Brouillon",
		value: "unpublished",
	},
	{
		label: "Non vérifié",
		value: "unverified",
	}
] as const;

export const kindOptions = [
  { label: "Protection sociale", value: "Protection sociale" },
  { label: "Santé", value: "Santé" },
  { label: "Transport", value: "Transport" },
  { label: "Enseignement", value: "Enseignement" },
  { label: "Emploi", value: "Emploi" },
  { label: "Fiscalité", value: "Fiscalité" },
  {
    label: "Protection de l'environnement",
    value: "Protection de l'environnement",
  },
  { label: "Loisirs - culture", value: "Loisirs - culture" },
  {
    label: "Logement - équipements collectifs",
    value: "Logement - équipements collectifs",
  },
  {
    label: "Ordre et sécurité publics",
    value: "Ordre et sécurité publics",
  },
  {
    label: "État civil - Identité - Citoyenneté",
    value: "État civil - Identité - Citoyenneté",
  },
  { label: "Justice", value: "Justice" },
  { label: "Agriculture", value: "Agriculture" },
  {
    label: "Vie / séjour à l'étranger",
    value: "Vie / séjour à l'étranger",
  },
  { label: "Aucun de ces domaines", value: "none" },
] as const;
import type { CollectionConfig } from "payload";

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

export const Entities: CollectionConfig = {
  slug: "entities",
  admin: {
    useAsTitle: "name",
  },
  labels: {
    singular: {
      fr: "Administration",
    },
    plural: {
      fr: "Administrations",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: { fr: "Nom de l'administration" },
    },
    {
      name: "siret",
      type: "number",
      label: { fr: "SIRET" },
    },
    {
      name: "kind",
      type: "select",
      label: { fr: "Secteur d'activité de l'administration" },
      options: [...kindOptions],
    },
  ],
};

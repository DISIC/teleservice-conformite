import type { kindOptions } from "~/payload/selectOptions";

export async function getEntityInfosFromSiret(siret: number): Promise<{
  name: string;
  siret: number;
  kind: (typeof kindOptions)[number]["value"];
}> {
  const apiKey = process.env.INSEE_API_KEY;

  if (!apiKey) return { name: `Entité ${siret}`, siret, kind: "none" };

  try {
    const res = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${siret}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-INSEE-Api-Key-Integration": apiKey,
        },
      },
    );

    if (res.status === 401 || res.status === 403) {
      console.error("INSEE API key is invalid or has expired.");

      return { name: `Entité ${siret}`, siret, kind: "none" };
    }

    const data = (await res.json()) as any;
    const etab = data?.etablissement ?? {};
    const unite = etab?.uniteLegale ?? {};
    const periodes = etab?.periodesEtablissement as any[] | undefined;

    const nameCandidate =
      unite?.denominationUniteLegale ||
      unite?.nomUniteLegale;

    const name = `${nameCandidate} ${unite?.sigleUniteLegale ? `(${unite?.sigleUniteLegale})` : ""}` || `Entité ${siret}`;

    const kind: (typeof kindOptions)[number]["value"] = "none";
    return { name, siret, kind };
  } catch (error) {
    console.error("Error fetching data from INSEE API.", error);

    return { name: `Entité ${siret}`, siret, kind: "none" };
  }
}
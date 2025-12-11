import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface AlbertResponse {
  taux: string | null;
  publishedAt: string | null;
  responsibleEntity: string | null;
  auditedPages: string[];
  technologies: string[];
}

async function downloadHtmlWithPlaywright(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }

  return await response.text();
}

async function extractAccessibilityRateWithAlbert(
  htmlContent: string
): Promise<any> {
  const apiKey = process.env.ALBERT_API_KEY;
  const apiUrl =
    process.env.ALBERT_API_URL || "https://albert.api.etalab.gouv.fr";

  if (!apiKey) {
    throw new Error("ALBERT_API_KEY not configured");
  }

  const footerStart = htmlContent.indexOf("<footer");
  let footerContent = "";
  if (footerStart !== -1) {
    const footerEnd = htmlContent.indexOf("</footer>", footerStart) + 9;
    footerContent = htmlContent.substring(footerStart, footerEnd);
  }

  const mainStart = htmlContent.indexOf("<main");
  let mainContent = "";
  if (mainStart !== -1) {
    const mainEnd = htmlContent.indexOf("</main>", mainStart) + 7;
    mainContent = htmlContent.substring(mainStart, mainEnd);
  } else {
    mainContent = htmlContent.substring(0, 20000);
  }

  const relevantContent = `${footerContent}\n\n${mainContent.substring(0, 15000)}`;

  const prompt = `Analyse le contenu HTML et extrait le taux d'accessibilité numérique, la date de publication, la liste des pages auditées, l'entité responsable ET les technologies utilisées.

RÈGLES POUR LE TAUX :
1. Si tu trouves "Accessibilité : totalement conforme" → taux = "100%"
2. Si tu trouves un pourcentage explicite (exemple: "83,08 % des critères" ou "83.08%") → utilise le pourcentage exact
3. Si tu trouves "non conforme" → taux = "0%"
4. Si rien n'est trouvé → taux = null

RÈGLES POUR LA DATE DE PUBLICATION :
1. Cherche des phrases comme "Établie le [date]", "Cette déclaration a été établie le [date]", "Publiée le [date]"
2. La date peut être au format "JJ/MM/AAAA" (ex: 17/11/2025) ou "JJ mois AAAA" (ex: 9 octobre 2024)
3. Convertis TOUJOURS la date au format "DD/MM/YYYY" (ex: 09/10/2024)
4. Si aucune date n'est trouvée → publishedAt = null

RÈGLES POUR LES PAGES AUDITÉES :
1. Cherche une section avec les mots-clés : "Échantillon", "Pages auditées", "Pages testées", "Liste des pages"
2. Extrait la liste des pages/URLs qui ont été auditées (souvent dans une liste <ul> ou <ol>)
3. Pour chaque page, utilise le format :
   - Si une URL est associée : "Nom de la page - https://url.complete"
   - Si pas d'URL : juste "Nom de la page"
4. Exemples de format attendu :
   - "Accueil - https://monservice.gouv.fr/"
   - "Page contact - https://monservice.gouv.fr/contact"
   - "Mentions légales" (si pas d'URL)
5. Si aucune liste de pages n'est trouvée → auditedPages = []
6. Limite à 20 pages maximum

RÈGLES POUR L'ENTITÉ RESPONSABLE :
1. Cherche le pattern "[Entité] s'engage à rendre son/ses/leur [service/site/sites]"
2. Extrait le nom complet de l'entité AVANT "s'engage"
3. Garde les articles (Le, La, L', Les) dans le nom
4. Exemples:
   - "Le ministère de la Culture s'engage..." → "Le ministère de la Culture"
   - "La DINUM s'engage..." → "La DINUM"
   - "L'Agence Nationale de la Cohésion des Territoires s'engage..." → "L'Agence Nationale de la Cohésion des Territoires"
5. Si non trouvé → responsibleEntity = null

RÈGLES POUR LES TECHNOLOGIES :
1. Cherche une section avec les mots-clés : "Technologies utilisées", "Technologies", "Technologie utilisée", "Technologies employées", "Technologies mises en œuvre"
2. Extrait la liste des technologies mentionnées (souvent présentées en liste ou séparées par des espaces/virgules)
3. Technologies courantes à rechercher : HTML5, HTML, CSS, JavaScript, SVG, PHP, React, Vue.js, Angular, Bootstrap, jQuery, etc.
4. Exemples de formats trouvés :
   - "Technologies utilisées pour la réalisation du site HTML5 SVG CSS JavaScript"
   - "Technologies : HTML5, CSS3, JavaScript"
   - Liste à puces avec chaque technologie
5. Retourne chaque technologie comme un élément séparé dans le tableau
6. Si aucune technologie n'est trouvée → technologies = []
7. Limite à 15 technologies maximum

Exemples de réponses attendues :
- {"taux": "100%", "publishedAt": "09/10/2024", "auditedPages": ["Accueil - https://site.gouv.fr/"], "responsibleEntity": "Le ministère de la Culture", "technologies": ["HTML5", "CSS", "JavaScript"]}
- {"taux": "83.08%", "publishedAt": "17/11/2025", "auditedPages": [], "responsibleEntity": "La DINUM", "technologies": ["HTML5", "SVG", "ARIA", "CSS", "JavaScript"]}
- {"taux": null, "publishedAt": null, "auditedPages": [], "responsibleEntity": null, "technologies": []} si rien n'est trouvé

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.

HTML :
${relevantContent}`;

  const payload = {
    model: "albert-small",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.1,
    max_tokens: 500,
  };

  const response = await fetch(`${apiUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Albert API error: ${response.statusText}`);
  }

  return await response.json();
}

function parseAlbertResponse(response: any): AlbertResponse {
  if (!response) {
    return {
      taux: null,
      publishedAt: null,
      responsibleEntity: null,
      auditedPages: [],
      technologies: [],
    };
  }

  try {
    const content = response.choices[0].message.content;

    const jsonMatch = content.match(
      /\{[^{}]*(?:\{[^{}]*\}|"[^"]*"|\[[^\]]*\]|[^{}])*\}/
    );

    let result: any;
    if (jsonMatch) {
      const jsonStr = jsonMatch[0].replace(/\n/g, " ").replace(/\r/g, "");
      result = JSON.parse(jsonStr);
    } else {
      result = JSON.parse(content);
    }

    return {
      taux: result.taux || null,
      publishedAt: result.publishedAt || null,
      responsibleEntity: result.responsibleEntity || null,
      auditedPages: Array.isArray(result.auditedPages)
        ? result.auditedPages
        : [],
      technologies: Array.isArray(result.technologies)
        ? result.technologies
        : [],
    };
  } catch (error) {
    console.error("Error parsing Albert response:", error);
    return {
      taux: null,
      publishedAt: null,
      responsibleEntity: null,
      auditedPages: [],
      technologies: [],
    };
  }
}

export const albertRouter = createTRPCRouter({
  analyzeUrl: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      const { url } = input;

      try {
        const htmlContent = await downloadHtmlWithPlaywright(url);
        const albertResponse =
          await extractAccessibilityRateWithAlbert(htmlContent);
        const parsedResult = parseAlbertResponse(albertResponse);

        return {
          data: parsedResult,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }),
});

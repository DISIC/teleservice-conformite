import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

import readAlbertPrompt from "~/utils/albert-prompt/albert-helper";

export interface AlbertResponse {
  service: { name: string | null, type: string | null; url: string | null; };
  taux: string | null;
  publishedAt: string | null;
  rgaaVersion?: string | null;
  auditRealizedBy: string | null;
  responsibleEntity: string | null;
  compliantElements: string[];
  technologies: string[];
  testEnvironments: string[];
  usedTools: string[];
  nonCompliantElements: string | null;
  disproportionnedCharge: string | null;
  optionalElements: string | null;
  contact: { email: string | null; url: string | null };
  schema: { currentYearSchemaUrl: string | null; },
}

function getRgaaVersion(rawVersion: string | null | undefined): string {
  if (!rawVersion) return "rgaa_4";

  const exactVersion = Math.floor(Number(rawVersion));

  return exactVersion ? `rgaa_${exactVersion}` : "rgaa_4";
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

  const albertPromptTemplate = readAlbertPrompt();

  const prompt = `${albertPromptTemplate}
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
    // max_tokens: 500,
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

function parseAlbertResponse(response: any): AlbertResponse | null {
  if (!response) {
    return null;
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
      service: {
        name: result.service?.name ?? result.service?.url ?? null,
        type: result.service?.type || null,
        url: result.service?.url || null,
      },
      taux: result.taux || null,
      rgaaVersion: getRgaaVersion(result.rgaaVersion) || null,
      auditRealizedBy: result.auditRealizedBy || null,
      publishedAt: result.publishedAt || null,
      responsibleEntity: result.responsibleEntity || null,
      compliantElements: Array.isArray(result.auditedPages)
        ? result.auditedPages
        : [],
      technologies: Array.isArray(result.technologies)
        ? result.technologies
        : [],
      testEnvironments: Array.isArray(result.testEnvironments)
        ? result.testEnvironments
        : [],
      usedTools: Array.isArray(result.usedTools) ? result.usedTools : [],
      nonCompliantElements: result.nonCompliantElements || null,
      disproportionnedCharge:
        result.disproportionnedCharge || null,
      optionalElements: result.optionalElements || null,
      contact: {
        email: result.contact?.email || null,
        url: result.contact?.url || null,
      },
      schema: { currentYearSchemaUrl: result.schema?.currentYearSchemaUrl || null },
    };
  } catch (error) {
    console.error("Error parsing Albert response:", error);
    return null;
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

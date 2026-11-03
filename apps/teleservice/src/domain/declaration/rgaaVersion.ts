import type { rgaaVersionOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type RgaaVersion = (typeof rgaaVersionOptions)[number]["value"];

// RGAA 5 drops the assessment tools list and introduces blocking elements.
export const requiresUsedTools = (version: RgaaVersion | null | undefined) =>
	version !== "rgaa_5";

// A blocking-elements answer left over from an RGAA 5 audit switched back to RGAA 4 is void.
export const reportsBlockingElements = (
	audit:
		| Pick<
				NonNullable<PopulatedDeclaration["audit"]>,
				"rgaa_version" | "hasBlockingElements"
		  >
		| null
		| undefined,
) => audit?.rgaa_version === "rgaa_5" && audit.hasBlockingElements === true;

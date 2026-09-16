import { buildModel, type ContentModel } from "./build";
import type { Problem } from "./problems";
import { readSources } from "./read";

export type CheckResult =
	| { ok: true; model: ContentModel }
	| { ok: false; problems: Problem[] };

// Structural problems are reported alone: coherence checks only run on a tree that read cleanly.
export function checkContent(contentDir: string): CheckResult {
	const read = readSources(contentDir);
	if (read.problems.length) return { ok: false, problems: read.problems };
	const built = buildModel(read.tree);
	if (built.problems.length) return { ok: false, problems: built.problems };
	return { ok: true, model: built.model };
}

export { buildModel, type ContentModel } from "./build";
export { formatProblem, type Problem } from "./problems";
export { readSources, type SourceTree } from "./read";
export * from "./schema/published";
export * from "./schema/sources";
export {
	DEFAULT_PUBLISH_OPTIONS,
	type PublishedFiles,
	type PublishOptions,
	serialize,
	toPublished,
	writePublished,
} from "./write";

import path from "node:path";
import { checkContent } from "./index";
import { formatProblem } from "./problems";
import { toPublished, writePublished } from "./write";

const [command, dirArg] = process.argv.slice(2);

if (command !== "check" && command !== "build") {
	console.error(
		"Usage : content check|build [dossier des sources, par défaut rgaa/content]",
	);
	process.exit(2);
}

const contentDir = path.resolve(
	dirArg ?? path.join(import.meta.dirname, "../../../rgaa/content"),
);
const shown = path.relative(process.cwd(), contentDir) || ".";
const result = checkContent(contentDir);

if (!result.ok) {
	for (const problem of result.problems)
		console.error(formatProblem(problem, shown));
	console.error(`\n✗ ${result.problems.length} problème(s) dans ${shown}`);
	process.exit(1);
}

const criteres = result.model.topics.flatMap((topic) => topic.criteria);
const tests = criteres
	.flatMap((critere) => Object.values(critere.referentiels))
	.reduce((count, declinaison) => count + declinaison.tests.length, 0);
console.log(
	`✓ ${shown} : ${criteres.length} critères, ${tests} tests, ${result.model.terms.length} termes du glossaire.`,
);

if (command === "build") {
	const dataDir = path.join(contentDir, "../data");
	for (const file of writePublished(dataDir, toPublished(result.model)))
		console.log(`→ ${path.relative(process.cwd(), file)}`);
}

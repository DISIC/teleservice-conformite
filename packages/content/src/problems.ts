export type Problem = {
	file: string;
	message: string;
	line?: number;
};

export function formatProblem(problem: Problem, prefix: string): string {
	const where = problem.line === undefined ? "" : `:${problem.line}`;
	return `${prefix}/${problem.file}${where} : ${problem.message}`;
}

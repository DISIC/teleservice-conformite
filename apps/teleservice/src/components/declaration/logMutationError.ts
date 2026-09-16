/**
 * Standard `onError` for the per-Section save mutations: logs the failed action
 * against its declaration. `subject` is the action phrase, e.g. "saving audit".
 */
export const logMutationError =
	(subject: string, declarationId: number | string) => (error: unknown) =>
		console.error(`Error ${subject} (declaration ${declarationId}):`, error);

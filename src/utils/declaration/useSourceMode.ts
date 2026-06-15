import { useState } from "react";
import { api } from "~/lib/api";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import type { DeclarationChangeFn } from "~/components/declaration/sections/Content";
import {
	deriveSourceMode,
	type SourceModeKind,
	type SourceModeValue,
} from "./sourceMode";
import { type LibraryLink, useLibraryLink } from "./useLibraryLink";

export type SourceModeController = {
	/** Mode read from persisted state; `null` while Undecided. */
	derived: SourceModeValue | null;
	/** What the radio shows: a pending local choice, else the derived mode. */
	effectiveMode: SourceModeValue | null;
	isLinked: boolean;
	libraryLink: LibraryLink;
	/** Declarations sharing the linked parent (incl. this one); undefined until loaded. */
	linkedCount: number | undefined;
	/** Drives a radio change. Custom-from-linked detaches; skip persists at once;
	 *  the input-revealing choices (custom, library) only set local state. */
	select: (value: SourceModeValue) => void;
};

type UseSourceModeArgs = {
	kind: SourceModeKind;
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
};

export function useSourceMode({
	kind,
	declaration,
	onDeclarationChange,
}: UseSourceModeArgs): SourceModeController {
	const [pending, setPending] = useState<SourceModeValue | null>(null);

	const derived = deriveSourceMode(kind, declaration);
	const libraryLink = useLibraryLink({
		kind,
		declaration,
		onDeclarationChange,
	});
	const parentId = libraryLink.linkedParentId;

	const skip = api.schema.skip.useMutation({
		onSuccess: ({ data: schema, status }) =>
			onDeclarationChange((prev) => ({
				...prev,
				schema,
				status: status ?? prev.status,
			})),
	});

	const countQuery = api.library.linkedDeclarations.useQuery(
		{ kind, id: parentId ?? 0 },
		{ enabled: parentId !== null },
	);

	const select = (value: SourceModeValue) => {
		// Detaching from a linked parent persists immediately (reload-driven).
		if (value === "custom" && derived === "linked") {
			libraryLink.onUnlink();
			return;
		}
		if (value === "skipped") skip.mutate({ declarationId: declaration.id });
		setPending(value);
	};

	return {
		derived,
		effectiveMode: pending ?? derived,
		isLinked: derived === "linked",
		libraryLink,
		linkedCount: parentId !== null ? countQuery.data?.length : undefined,
		select,
	};
}

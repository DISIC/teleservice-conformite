import { useState } from "react";
import { applySavedDeclaration } from "~/components/declaration/sections/applySavedDeclaration";
import type { DeclarationChangeFn } from "~/components/declaration/sections/defineSection";
import {
	deriveSourceMode,
	type LibrarySectionKind,
	type SourceModeValue,
} from "~/domain/declaration/sourceMode";
import { api } from "~/lib/api";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
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
	/** `null` for a Section without a Library — the controller is then `null` too. */
	kind: LibrarySectionKind | null;
	declaration: PopulatedDeclaration;
	onDeclarationChange: DeclarationChangeFn;
};

export function useSourceMode({
	kind,
	declaration,
	onDeclarationChange,
}: UseSourceModeArgs): SourceModeController | null {
	const [pending, setPending] = useState<SourceModeValue | null>(null);

	const derived = kind ? deriveSourceMode(kind, declaration) : null;
	const libraryLink = useLibraryLink({
		kind,
		declaration,
		onDeclarationChange,
	});
	const parentId = libraryLink.linkedParentId;

	const skip = api.schema.skip.useMutation({
		onSuccess: applySavedDeclaration(onDeclarationChange),
	});

	const countQuery = api.library.linkedDeclarations.useQuery(
		{ kind: kind ?? "contact", id: parentId ?? 0 },
		{ enabled: kind !== null && parentId !== null },
	);

	if (!kind) return null;

	const select = (value: SourceModeValue) => {
		// Detaching from a linked parent is a persisted write, not a local mode flip.
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

import type { StandardSchemaV1 } from "@tanstack/react-form";
import type { ReactNode } from "react";
import type { SectionSlug } from "~/domain/declaration/sections";
import type {
	LibrarySectionKind,
	SourceModeValue,
} from "~/domain/declaration/sourceMode";
import type { EditingMode } from "~/domain/declaration/status";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type DeclarationChangeFn = (
	updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
) => void;

/** Every save returns the whole Declaration as written. */
export type SaveResult = { data: PopulatedDeclaration };

export type SectionSaveOptions = {
	onSuccess: (result: SaveResult) => void;
	onError: (error: unknown) => void;
};

export type SourceModeOption = {
	value: SourceModeValue;
	label: ReactNode;
	hintText?: ReactNode;
	illustration?: ReactNode;
};

export type SectionLibrary = {
	kind: LibrarySectionKind;
	/** Legend of the source radio — must read correctly whatever options remain. */
	legend: string;
	options: SourceModeOption[];
};

export type SectionRenderArgs<TForm> = {
	form: TForm;
	readOnly: boolean;
	declaration: PopulatedDeclaration;
	mode: EditingMode;
};

/**
 * What differs between Sections. Everything else — editing mode, read-only
 * state, autosave, error reveal, the frame and its buttons, the terminal publish
 * gate, the source-mode radio — is the `Section` runtime's job.
 */
export type SectionDefinition<TValues, TForm> = {
	slug: SectionSlug;
	schema: StandardSchemaV1<TValues, unknown>;
	toValues: (declaration: PopulatedDeclaration) => TValues;
	/** Hook: binds the Section's tRPC mutation; the runtime supplies the fold and the error sink. */
	useSave: (
		declaration: PopulatedDeclaration,
		options: SectionSaveOptions,
	) => { save: (values: TValues) => Promise<SaveResult>; isPending: boolean };
	renderForm: (args: SectionRenderArgs<TForm>) => ReactNode;
	/** Saved data exists to toggle read-only/edit; false opens standalone straight in edit. */
	isEditable?: (declaration: PopulatedDeclaration) => boolean;
	/** Nothing to save right now: hides the action buttons and holds autosave. */
	hideActions?: (declaration: PopulatedDeclaration) => boolean;
	/** Hold autosave until the values are storable. */
	autosaveWhen?: (values: TValues) => boolean;
	library?: SectionLibrary;
};

export type AnySectionDefinition = SectionDefinition<any, any>;

export function defineSection<TValues, TForm>(
	definition: SectionDefinition<TValues, TForm>,
): AnySectionDefinition {
	return definition;
}

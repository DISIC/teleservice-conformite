import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useCallback, useState } from "react";
import { useCommonStyles } from "~/components/ui/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SectionShell } from "~/components/declaration/sections/Shell";
import type { EditingMode } from "~/utils/declaration/status";

type UseSectionFormArgs = {
	/** Section title — drives <Head> and SectionShell. */
	title: string;
	declaration: PopulatedDeclaration;
	/** The underlying data already exists; edit/cancel is offered. */
	isEditable: boolean;
	/** Override the initial readOnly state. Defaults to `isEditable`. */
	initialReadOnly?: boolean;
	/**
	 * Pin the Section read-only even in sequential mode (which otherwise keeps
	 * every Section editable). Used for Library-linked groups: their content is
	 * owned by the parent and edited from the Library, so it must never be
	 * editable inline. See ADR-0004.
	 */
	locked?: boolean;
	isSaving: boolean;
	prevHref: string | null;
	nextHref: string | null;
	/** Hide the top-right action buttons for informational, nothing-to-save sections. */
	hideActions?: boolean;
	/** Sequential (Brouillon walkthrough) vs standalone editing. See ADR-0003. */
	mode?: EditingMode;
};

/**
 * Minimal shape `Frame` needs from a tanstack form instance. Defined
 * structurally so we don't have to thread the form's heavy generic signature
 * through this module.
 */
type FrameForm = {
	handleSubmit: () => void;
	reset: () => void;
	validate: (cause: "submit") => unknown;
};

type FrameProps = {
	form: FrameForm;
	children: ReactNode;
	/** Rendered above the form in edit mode (e.g. EntityLibraryPicker). */
	before?: ReactNode;
};

/**
 * Owns the section render skeleton (<Head>, SectionShell, the <form> wrapper,
 * the white-background body) and the readOnly state machine. The caller still
 * owns `useAppForm` and the mutation hook — tanstack's inferred form type does
 * not survive being threaded through a generic hook. After a successful save,
 * call `afterSave()` from the form's `onSubmit` — in standalone it exits edit
 * mode, in sequential it advances to the next Section.
 */
export function useSectionForm({
	title,
	declaration,
	isEditable,
	initialReadOnly,
	locked,
	isSaving,
	prevHref,
	nextHref,
	hideActions,
	mode = "standalone",
}: UseSectionFormArgs) {
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const isSequential = mode === "sequential";
	// A locked Section stays read-only everywhere (overrides sequential). Otherwise
	// sequential mode keeps every Section permanently editable (no toggle).
	const [readOnly, setReadOnly] = useState(
		locked ? true : isSequential ? false : (initialReadOnly ?? isEditable),
	);

	const enterEdit = () => setReadOnly(false);
	const exitEdit = () => setReadOnly(true);

	// Called from the form's `onSubmit` success path: in sequential mode this
	// advances to the next Section (navigation is gated behind a clean save);
	// in standalone it returns the Section to read-only.
	const afterSave = useCallback(() => {
		if (isSequential) {
			if (nextHref) {
				router.push(nextHref, undefined, { shallow: true, scroll: false });
			}
			return;
		}
		setReadOnly(true);
	}, [isSequential, nextHref, router]);

	const Frame = useCallback(
		({ form, children, before }: FrameProps) => (
			<>
				<Head>
					<title>
						{title} - Déclaration de {declaration.name} - Téléservice Conformité
					</title>
				</Head>
				<SectionShell
					title={title}
					isEditable={isEditable}
					readOnly={readOnly}
					onEnterEdit={enterEdit}
					onCancelEdit={() => {
						form.reset();
						exitEdit();
					}}
					onSave={() => form.handleSubmit()}
					isSaving={isSaving}
					prevHref={prevHref}
					nextHref={nextHref}
					hideActions={hideActions}
					mode={mode}
				>
					{before}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						onInvalid={() => form.validate("submit")}
					>
						<div className={commonClasses.partStack}>{children}</div>
					</form>
				</SectionShell>
			</>
		),
		[
			title,
			declaration.name,
			isEditable,
			readOnly,
			isSaving,
			prevHref,
			nextHref,
			hideActions,
			mode,
			commonClasses.partStack,
		],
	);

	return { readOnly, enterEdit, exitEdit, afterSave, Frame };
}

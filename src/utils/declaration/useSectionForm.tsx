import Head from "next/head";
import { type ReactNode, useCallback, useState } from "react";
import { useCommonStyles } from "~/components/ui/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { SectionShell } from "~/components/declaration/sections/Shell";

type UseSectionFormArgs = {
	/** Section title — drives <Head> and SectionShell. */
	title: string;
	declaration: PopulatedDeclaration;
	/** The underlying data already exists; edit/cancel is offered. */
	isEditable: boolean;
	/** Override the initial readOnly state. Defaults to `isEditable`. */
	initialReadOnly?: boolean;
	isSaving: boolean;
	prevHref: string | null;
	nextHref: string | null;
	/** Hide the top-right action buttons for informational, nothing-to-save sections. */
	hideActions?: boolean;
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
 * call `exitEdit()` from the form's `onSubmit`.
 */
export function useSectionForm({
	title,
	declaration,
	isEditable,
	initialReadOnly,
	isSaving,
	prevHref,
	nextHref,
	hideActions,
}: UseSectionFormArgs) {
	const { classes: commonClasses } = useCommonStyles();
	const [readOnly, setReadOnly] = useState(initialReadOnly ?? isEditable);

	const enterEdit = () => setReadOnly(false);
	const exitEdit = () => setReadOnly(true);

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
			commonClasses.partStack,
		],
	);

	return { readOnly, enterEdit, exitEdit, Frame };
}

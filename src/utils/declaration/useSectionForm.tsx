import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode, useCallback, useState } from "react";
import { useCommonStyles } from "~/components/ui/commonStyles";
import { RequiredFieldsNotice } from "~/components/form/RequiredField";
import { SectionShell } from "~/components/declaration/sections/Shell";
import type { EditingMode } from "~/utils/declaration/status";

type UseSectionFormArgs = {
	title: string;
	isEditable: boolean;
	initialReadOnly?: boolean;
	/** Pin read-only even in sequential mode; used for Library-linked groups. */
	locked?: boolean;
	isSaving: boolean;
	prevHref: string | null;
	nextHref: string | null;
	hideActions?: boolean;
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
	before?: ReactNode;
	/** Terminal publish CTA; bypasses the section form submit when provided. */
	onPublish?: () => void;
	/** Suppress the required-fields caption when the body has no editable fields
	 * (e.g. a Library-linked shared entity rendered as a read-only card). */
	hideRequiredNotice?: boolean;
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

	const enterEdit = useCallback(() => setReadOnly(false), []);
	const exitEdit = useCallback(() => setReadOnly(true), []);

	// Sequential mode advances on a clean save; standalone returns to read-only.
	const afterSave = useCallback(() => {
		if (isSequential) {
			if (nextHref) {
				router.push(nextHref, undefined, { shallow: true, scroll: false });
			}
			return;
		}
		setReadOnly(true);
	}, [isSequential, nextHref, router]);

	// These deps must stay stable during autosave: a change remounts `Frame` and
	// wipes in-progress field validation.
	const Frame = useCallback(
		({ form, children, before, hideRequiredNotice, onPublish }: FrameProps) => (
			<>
				<Head>
					<title>{title} - Téléservice Conformité</title>
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
					onPublish={onPublish}
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
						{!readOnly && !hideRequiredNotice && <RequiredFieldsNotice />}
						<div className={commonClasses.partStack}>{children}</div>
					</form>
				</SectionShell>
			</>
		),
		[
			title,
			isEditable,
			readOnly,
			isSaving,
			prevHref,
			nextHref,
			hideActions,
			mode,
			commonClasses.partStack,
			enterEdit,
			exitEdit,
		],
	);

	return { readOnly, enterEdit, exitEdit, afterSave, Frame };
}

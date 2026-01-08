import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/router";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

import type { Declaration } from "~/payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { tss } from "tss-react";
import { MultiStep } from "~/components/MultiStep";
import { useAppForm } from "~/utils/form/context";
import {
	SchemaForm as InitialSchemaForm,
	CurrentYearSchemaLinksForm,
} from "~/utils/form/schema/form";
import { schemaFormOptions } from "~/utils/form/schema/schema";
import { api } from "~/utils/api";

type Steps<T> = {
	slug: T;
	title: string;
};

export default function SchemaForm({
	declarationId,
}: { declarationId: number }) {
	const { classes } = useStyles();
	const router = useRouter();

	const sections = ["schema", "currentYearSchemaLinks"] as const;

	type Section = (typeof sections)[number];

	const { mutateAsync: createSchema } = api.schema.create.useMutation({
		onSuccess: async () => {
			router.push(`/declaration/${declarationId}`);
		},
		onError: (error) => {
			console.error("Error adding schema:", error);
		},
	});

	const goToPreviousSection = (currentSection: Section): Section | null => {
		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex > 0) {
			return sections[currentIndex - 1] ?? null;
		}
		return null;
	};

	const goToNextSection = (currentSection: Section): Section | null => {
		const currentIndex = sections.indexOf(currentSection);
		if (currentIndex < sections.length - 1) {
			return sections[currentIndex + 1] ?? null;
		}
		return null;
	};

	const onClickCancel = () => {
		if (section === "schema") {
			router.push(`/declaration/${declarationId}`);
		} else {
			const previousSection = goToPreviousSection(section);
			if (previousSection) {
				form.setFieldValue("section", previousSection);
			}
		}
	};

	const addSchema = async ({
		annualSchemaLink,
		declarationId,
	}: { annualSchemaLink: string; declarationId: number }) => {
		try {
			createSchema({ annualSchemaLink, declarationId });
		} catch (error) {
			console.error("Error adding schema:", error);
		}
	};

	const form = useAppForm({
		...schemaFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "currentYearSchemaLinks") {
				alert(JSON.stringify(value, null, 2));
				await addSchema({
					annualSchemaLink: value?.annualSchemaLink ?? "",
					declarationId,
				});
			} else {
				const nextSection = goToNextSection(value.section as Section);
				if (nextSection) formApi.setFieldValue("section", nextSection);
			}
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	return (
		<div className={classes.main}>
			<h2>Plans d'actions</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					<p>Tous les champs sont obligatoires sauf précision contraire</p>
					{section === "schema" && <InitialSchemaForm form={form} />}
					{section === "currentYearSchemaLinks" && (
						<CurrentYearSchemaLinksForm form={form} />
					)}
				</div>
				<form.AppForm>
					<div className={classes.actionButtonsContainer}>
						<form.CancelButton
							label="Retour"
							onClick={onClickCancel}
							priority="tertiary"
						/>
						<form.SubscribeButton
							label="Continuer"
							iconId="fr-icon-arrow-right-line"
							iconPosition="right"
						/>
					</div>
				</form.AppForm>
			</form>
		</div>
	);
}

const useStyles = tss.withName(SchemaForm.name).create({
	main: {
		marginTop: fr.spacing("6v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		// backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

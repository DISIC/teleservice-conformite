import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/router";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

import type { Declaration } from "payload/payload-types";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { tss } from "tss-react";
import { MultiStep } from "~/components/MultiStep";
import { useAppForm } from "~/utils/form/context";
import { DeclarationAuditForm } from "~/utils/form/readonly/form";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";
import AuditMultiStepForm from "~/components/declaration/AuditMultiStepForm";

type Steps<T> = {
	slug: T;
	title: string;
};

export default function AuditPage({
	declaration,
}: { declaration: Declaration | null }) {
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const router = useRouter();

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	declarationMultiStepFormOptions.defaultValues.audit = {
		url: "",
		date: "",
		report: undefined,
		matrix: undefined,
		realisedBy: "",
		rgaa_version: "rgaa_4",
		rate: 0,
		pages: [{ label: "", url: "" }],
		technologies: [""],
		testEnvironments: [{ kind: "", os: "" }],
		tools: [""],
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "general") {
				formApi.setFieldValue("section", "audit");
			} else {
				alert(JSON.stringify(value, null, 2));
			}
		},
	});

	if (!declaration?.audit) {
		return <AuditMultiStepForm declarationId={declaration?.id} />;
	}

	return (
		<section
			id="audit"
			className={classes.main}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: fr.spacing("6w"),
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<h2 style={{ fontSize: "16px", color: "grey" }}>
					Verifiez les informations et modifiez-les si necessaire
				</h2>
				<Button priority="secondary" onClick={onEditInfos}>
					{!editMode ? "Modifier" : "Annuler"}
				</Button>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
				}}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className={classes.formWrapper}>
						<DeclarationAuditForm
							form={form}
							readOnly={!editMode}
							isAchieved={true}
						/>
						{editMode && (
							<form.AppForm>
								<form.SubscribeButton label={"Valider"} />
							</form.AppForm>
						)}
					</div>
				</form>
			</div>
		</section>
	);
}

const useStyles = tss.withName(AuditPage.name).create({
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
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			// redirect: { destination: "/" },
		};
	}

	const payload = await getPayload({ config });

	try {
		const declaration = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		return {
			props: {
				declaration: declaration || null,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			// redirect: { destination: "/" },
			props: {},
		};
	}
};

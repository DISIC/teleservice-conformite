import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import type { Declaration } from "~/payload/payload-types";
import { useAppForm } from "~/utils/form/context";
import { DeclarationAuditForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import AuditMultiStepForm from "~/components/declaration/AuditMultiStepForm";
import { getPopulated } from "~/utils/payload-helper";

export default function AuditPage({
	declaration,
}: { declaration: Declaration }) {
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const router = useRouter();
	const audit = getPopulated(declaration?.audit);

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	readOnlyFormOptions.defaultValues.audit = {
		...readOnlyFormOptions.defaultValues.audit,
		date: new Date(audit?.date ?? "").toLocaleDateString() ?? "",
		grid: audit?.auditGrid ?? undefined,
		report: audit?.auditReport ?? undefined,
		realisedBy: audit?.realisedBy ?? "",
		rgaa_version: audit?.rgaa_version ?? "rgaa_4",
		rate: audit?.rate ?? 0,
		compliantElements: audit?.compliantElements ?? [],
		technologies: audit?.toolsUsed ?? [],
		testEnvironments: audit?.testEnvironments ?? [],
		nonCompliantElements: audit?.nonCompliantElements ?? "Non",
		disproportionnedCharge: audit?.disproportionnedCharge ?? "Non",
		optionalElements: audit?.exemption ?? "Non",
	};

	const form = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			alert(JSON.stringify(value, null, 2));
		},
	});

	if (!declaration?.audit) {
		return <AuditMultiStepForm declarationId={declaration?.id} />;
	}

	return (
		<section id="audit" className={classes.main}>
			<div className={classes.header}>
				<h2 className={classes.description}>
					Verifiez les informations et modifiez-les si necessaire
				</h2>
				<Button priority="secondary" onClick={onEditInfos}>
					{!editMode ? "Modifier" : "Annuler"}
				</Button>
			</div>

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
		</section>
	);
}

const useStyles = tss.withName(AuditPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	description: {
		fontSize: "1rem",
		color: "grey",
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
			redirect: { destination: "/declarations" },
		};
	}

	const payload = await getPayload({ config });

	try {
		const declaration = await payload.findByID({
			collection: "declarations",
			id: Number.parseInt(id),
			depth: 3,
		});

		if (!declaration) {
			return {
				props: {},
				redirect: { destination: "/declarations" },
			};
		}

		return {
			props: {
				declaration: declaration || null,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/declarations" },
			props: {},
		};
	}
};

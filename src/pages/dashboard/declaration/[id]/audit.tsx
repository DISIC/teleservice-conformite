import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Innovation from "@codegouvfr/react-dsfr/picto/Innovation";

import { useAppForm } from "~/utils/form/context";
import { DeclarationAuditForm } from "~/utils/form/readonly/form";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import AuditMultiStepForm from "~/components/declaration/AuditMultiStepForm";
import { api } from "~/utils/api";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { ReadOnlyDeclarationAudit } from "~/components/declaration/ReadOnlyDeclaration";
import PopupMessage from "~/components/declaration/PopupMessage";
import VerifyGeneratedInfoPopUpMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";

export default function AuditPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const router = useRouter();
	const { classes } = useStyles();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const [isAchieved, setIsAchieved] = useState(!!declaration?.audit);
	const audit = declaration?.audit;

	const { mutateAsync: updateAudit } = api.audit.update.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				audit: result.data,
			}));
			setEditMode(false);
		},
		onError: async (error) => {
			console.error(`Error updating audit with id ${audit?.id}`, error);
		},
	});

	const { mutateAsync: deleteAudit } = api.audit.delete.useMutation({
		onSuccess: async () => {
			router.push(`/dashboard/declaration/${declaration?.id}`);
		},
		onError: async (error) => {
			console.error(`Error deleting audit with id ${audit?.id}`, error);
		},
	});

	const { mutateAsync: updateStatus } = api.audit.updateStatus.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				audit: {
					...prev.audit,
					...result.data,
				},
			}));
		},
		onError: async (error) => {
			console.error(
				`Error updating declaration status with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const onEditInfos = () => {
		setEditMode((prev) => !prev);

		if (editMode) setIsAchieved(!!declaration?.audit);
	};

	if (audit) {
		readOnlyFormOptions.defaultValues = {
			...readOnlyFormOptions.defaultValues,
			section: "audit",
			audit: {
				date: audit?.date
					? new Date(audit.date).toISOString().slice(0, 10)
					: "",
				report: audit?.auditReport ?? "",
				realisedBy: audit?.realisedBy ?? "",
				rgaa_version: audit?.rgaa_version ?? "rgaa_4",
				rate: audit?.rate ?? 0,
				compliantElements: audit?.compliantElements ?? "",
				technologies: audit?.technologies?.map((tech) => tech.name) ?? [],
				usedTools: audit?.usedTools?.map((tech) => tech.name) ?? [],
				testEnvironments: audit?.testEnvironments ?? [],
				nonCompliantElements: audit?.nonCompliantElements ?? "",
				disproportionnedCharge: audit?.disproportionnedCharge ?? "",
				optionalElements: audit?.optionalElements ?? "",
			},
		};
	}

	const deleteDeclarationAudit = async (auditId: number) => {
		try {
			await deleteAudit({ id: auditId, declarationId: declaration.id });
		} catch (error) {
			console.error(`Error deleting audit with id ${auditId}:`, error);
		}
	};

	const updateDeclarationAudit = async (auditId: number, auditData: any) => {
		try {
			await updateAudit({
				audit: {
					id: auditId,
					declarationId: declaration.id,
					...auditData,
				},
			});
		} catch (error) {
			console.error(`Error deleting audit with id ${auditId}:`, error);
		}
	};

	const updateAuditStatus = async () => {
		try {
			await updateStatus({
				declarationId: declaration.id,
				id: declaration?.audit?.id ?? -1,
				status: "default",
			});
		} catch (error) {
			return;
		}
	};

	const form = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (!isAchieved && declaration?.audit) {
				await deleteDeclarationAudit(audit?.id ?? -1);

				return;
			}

			await updateDeclarationAudit(audit?.id ?? -1, value.audit);
		},
	});

	if (!declaration?.audit) {
		return <AuditMultiStepForm declaration={declaration ?? null} />;
	}

	return (
		<section id="audit" className={classes.main}>
			<div className={classes.container}>
				<Breadcrumb
					homeLinkProps={{
						href: "/dashboard",
					}}
					segments={[
						{
							label: declaration?.name ?? "",
							linkProps: { href: `/dashboard/declaration/${declaration?.id}` },
						},
					]}
					currentPageLabel="Résultat de l’audit"
				/>
				<div>
					<h1>{declaration?.name ?? ""} - Résultat de l’audit</h1>
					{declaration?.audit.status === "unverified" && (
						<VerifyGeneratedInfoPopUpMessage />
					)}
					<div className={classes.headerAction}>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					</div>
				</div>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					{editMode ? (
						<>
							<DeclarationAuditForm
								form={form}
								isAchieved={isAchieved}
								onChangeIsAchieved={(value) => setIsAchieved(value)}
							/>
							<form.AppForm>
								<form.SubscribeButton label={"Valider"} />
							</form.AppForm>
						</>
					) : (
						<ReadOnlyDeclarationAudit declaration={declaration ?? null} />
					)}
					{declaration.audit.status === "unverified" && !editMode && (
						<div className={classes.validateButton}>
							<Button onClick={updateAuditStatus}>
								Valider les informations
							</Button>
						</div>
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
		gap: fr.spacing("2w"),
	},
	container: {
		display: "flex",
		flexDirection: "column",
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		marginBottom: fr.spacing("6w"),
	},
	headerAction: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	description: {
		fontSize: "1rem",
		color: "grey",
	},
	validateButton: {
		marginTop: fr.spacing("4w"),
		display: "flex",
		justifyContent: "flex-end",
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
			redirect: { destination: "/dashboard" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	return {
		props: {
			declaration: declaration,
		},
	};
};

import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useMemo, useState } from "react";
import { tss } from "tss-react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { ContactTypeForm } from "~/utils/form/contact/form";
import { contactFormOptions, type ZContact } from "~/utils/form/contact/schema";
import { useAppForm } from "~/utils/form/context";

export default function ContactPage({
	declaration: initialDeclaration,
}: {
	declaration: PopulatedDeclaration;
}) {
	const { classes } = useStyles();
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(!!declaration?.contact);

	const onEditInfos = () => setReadOnly((prev) => !prev);

	const { mutateAsync: createContact } = api.contact.create.useMutation({
		onSuccess: () => {
			const isComplete = declaration.audit && declaration.actionPlan;
			router.push(
				`/dashboard/declaration/${declaration.id}${isComplete ? "/preview" : ""}`,
			);
		},
		onError: (error) => console.error("Error adding contact:", error),
	});

	const { mutateAsync: updateContact } = api.contact.update.useMutation({
		onSuccess: (result) => {
			setDeclaration((prev) => ({
				...prev,
				contact: result.data,
			}));
			setReadOnly(true);
		},
		onError: (error) =>
			console.error(
				`Error updating contact for declaration with id ${declaration?.id}:`,
				error,
			),
	});

	const defaultValues: ZContact = useMemo(() => {
		if (!declaration.contact) return contactFormOptions.defaultValues;

		const contactType: ZContact["contactType"] = [];
		if (declaration.contact.url) contactType.push("onlineForm");
		if (declaration.contact.email) contactType.push("contactPoint");

		return {
			contactType,
			contactLink: declaration.contact.url || "",
			emailContact: declaration.contact.email || "",
		};
	}, [declaration.contact]);

	const form = useAppForm({
		...contactFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!declaration?.contact?.id) {
				await createContact({ ...value, declarationId: declaration.id });
			} else {
				await updateContact({
					...value,
					id: declaration.contact.id,
					declarationId: declaration.id,
				});
			}
		},
	});

	return (
		<>
			<Head>
				<title>
					Contact - Déclaration de {declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Contact"
				breadcrumbLabel={declaration?.name ?? ""}
				showValidateButton={
					!readOnly &&
					(declaration?.contact?.status === "fromAI" ||
						declaration?.contact?.status === "fromAra")
				}
				isEditable={!!declaration?.contact}
				readOnly={readOnly}
				onToggleEdit={onEditInfos}
				isAiGenerated={declaration?.contact?.status === "fromAI"}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={commonClasses.whiteBackground}>
						<ContactTypeForm form={form} readOnly={readOnly} />
					</div>
					<form.AppForm>
						<div className={classes.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								ariaLabel="Retour à la déclaration"
								onClick={() =>
									router.push(`/dashboard/declaration/${declaration.id}`)
								}
								priority="tertiary"
							/>
							{!readOnly && (
								<form.SubscribeButton
									label={declaration?.contact ? "Valider" : "Continuer"}
									iconId="fr-icon-arrow-right-s-line"
									iconPosition="right"
								/>
							)}
						</div>
					</form.AppForm>
				</form>
			</DeclarationForm>
		</>
	);
}

const useStyles = tss.withName(ContactPage.name).create({
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
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

	const declaration = await getDeclarationById(
		payload,
		Number.parseInt(id, 10),
	);

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

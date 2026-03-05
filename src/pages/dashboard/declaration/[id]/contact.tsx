import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useMemo, useState } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { ContactTypeForm } from "~/utils/form/contact/form";
import {
	contactFormOptions,
	type ZContactForm,
} from "~/utils/form/contact/schema";
import { useAppForm } from "~/utils/form/context";

export default function ContactPage({
	declaration: initialDeclaration,
}: {
	declaration: PopulatedDeclaration;
}) {
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(!!declaration?.contact);

	const onEditInfos = () => {
		if (!readOnly) form.reset();
		setReadOnly((prev) => !prev);
	};

	const { mutateAsync: upsertContact } = api.contact.upsert.useMutation({
		onSuccess: ({ data }) => {
			if (!declaration.contact) {
				const isComplete = declaration.audit && declaration.actionPlan;
				router.push(
					`/dashboard/declaration/${declaration.id}${isComplete ? "/preview" : ""}`,
				);
			} else {
				setDeclaration((prev) => ({ ...prev, contact: data }));
				setReadOnly(true);
			}
		},
		onError: (error) => console.error("Error upserting contact:", error),
	});

	const defaultValues: ZContactForm = useMemo(() => {
		if (!declaration.contact) return contactFormOptions.defaultValues;

		const contactType: ZContactForm["contactType"] = [];
		if (declaration.contact.url) contactType.push("onlineForm");
		if (declaration.contact.email) contactType.push("contactPoint");

		return {
			contactType,
			url: declaration.contact.url || "",
			email: declaration.contact.email || "",
		};
	}, [declaration.contact]);

	const form = useAppForm({
		...contactFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsertContact({
				...value,
				id: declaration.contact?.id,
				declarationId: declaration.id,
			});
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
				isEditable={!!declaration?.contact}
				readOnly={readOnly}
				onToggleEdit={onEditInfos}
				isAiGenerated={
					declaration.contact?.toVerify && declaration.fromSource === "ai"
				}
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
						<div className={commonClasses.actionButtonsContainer}>
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
									label={
										declaration.contact?.toVerify
											? "Valider les informations"
											: "Valider"
									}
									iconId="fr-icon-check-line"
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

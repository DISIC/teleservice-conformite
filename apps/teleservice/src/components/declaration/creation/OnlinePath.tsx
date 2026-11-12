import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Image from "next/image";
import { useState } from "react";
import { tss } from "tss-react";
import AraLogo from "~/assets/ara-logo.svg";
import { z } from "zod";
import DeclarationLoader from "~/components/declaration/DeclarationLoader";
import { useAppForm } from "~/forms/context";
import { submitFormOptions } from "~/forms/formOptions";
import { api } from "~/lib/api";
import { handleFormSubmit } from "~/components/form/handleFormSubmit";
import { Actions } from "./Actions";

const ARA_DECLARATION_PREFIX = "https://ara.numerique.gouv.fr/declaration/";

const onlineSchema = z.object({
	url: z.url({ message: "Lien invalide (ex: https://www.example.fr)" }),
});

const defaultValues: z.infer<typeof onlineSchema> = { url: "" };

function isAraUrl(url: string) {
	return url.startsWith(ARA_DECLARATION_PREFIX);
}

/**
 * Import from a declaration already online. An Ara URL is imported from its
 * structured report; any other URL is parsed by a sovereign LLM (Albert) and
 * the extracted data is flagged "to verify".
 */
export function OnlinePath({
	onCreated,
}: {
	onCreated: (declarationId: number) => void;
}) {
	const { classes, cx } = useStyles();
	const [hasFailed, setHasFailed] = useState(false);

	const mutationOptions = {
		onSuccess: (result: { data: number }) => onCreated(result.data),
		onError: () => setHasFailed(true),
	};
	const fromAra = api.declaration.createFromAra.useMutation(mutationOptions);
	const fromUrl =
		api.declaration.createFromUrlAnalysis.useMutation(mutationOptions);

	const form = useAppForm({
		...submitFormOptions(defaultValues, onlineSchema),
		onSubmit: async ({ value }) => {
			setHasFailed(false);
			const url = value.url.trim();
			// Service failure surfaces through the mutation's onError (the Alert
			// below); swallow the rejection so the form isn't left "submitting".
			const request = isAraUrl(url)
				? fromAra.mutateAsync({ araUrl: url })
				: fromUrl.mutateAsync({ url });
			await request.catch(() => {});
		},
	});

	if (fromAra.isPending) return <DeclarationLoader duration={2000} />;
	if (fromUrl.isPending) return <DeclarationLoader duration={15000} />;

	return (
		<form onSubmit={handleFormSubmit(form)} noValidate>
			{hasFailed && (
				<Alert
					severity="error"
					title="Impossible de récupérer la déclaration en ligne"
					description="Vérifiez l'URL et réessayez, ou créez la déclaration manuellement."
					small
					className={fr.cx("fr-mb-6v")}
				/>
			)}
			<div className={cx(fr.cx("fr-mb-6v"), classes.araNotice)}>
				<Image src={AraLogo} alt="" className={classes.araLogo} />
				<p className={cx(fr.cx("fr-text--xs", "fr-mb-0"), classes.araText)}>
					Si Ara a été utilisé pour l'audit et la déclaration, l’URL de la
					déclaration est disponible dans la liste des livrables de votre audit.
					<br />
					Format attendu : https://ara.numerique.gouv.fr/declaration/XXXXXXXX
				</p>
			</div>
			<form.AppField name="url">
				{(field) => (
					<field.TextField
						label="URL de votre déclaration d’accessibilité"
						hintText="Format attendu : https://www.example.fr/declaration"
						nativeInputProps={{ type: "url" }}
						required
					/>
				)}
			</form.AppField>
			<Actions />
		</form>
	);
}

const useStyles = tss.withName(OnlinePath.name).create({
	araNotice: {
		display: "flex",
		alignItems: "center",
		gap: fr.spacing("4v"),
	},
	araLogo: {
		flexShrink: 0,
		width: "3rem",
		height: "auto",
	},
	araText: {
		color: fr.colors.decisions.text.mention.grey.default,
	},
});

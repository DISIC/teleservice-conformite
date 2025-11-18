import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import { tss } from "tss-react";
import z from "zod";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";

export default function Home() {
	const { classes } = useStyles();

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [result, setResult] = useState<any | null>(null);

	const { mutateAsync: getInfoFromAra, isPending } =
		api.declaration.getInfoFromAra.useMutation({
			onSuccess: (data) => setResult(data),
			onError: (error) => console.error("error", error),
		});

	const form = useAppForm({
		defaultValues: {
			id: "",
		},
		validators: {
			onSubmit: z.object({
				id: z.string().min(1, "L'identifiant ARA est requis"),
			}),
		},
		onSubmit: async ({ value }) => {
			getInfoFromAra(value);
		},
	});

	return (
		<div className={classes.main}>
			<form
				className={fr.cx("fr-mb-6v")}
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<h2>Test Ara Informations</h2>
				<form.AppField
					name="id"
					children={(field) => <field.TextField label="Identifiant ARA" />}
				/>
				<form.Subscribe
					selector={(form) => [form.canSubmit]}
					children={(canSubmit) => (
						<Button type="submit" disabled={!canSubmit || isPending}>
							Valider
						</Button>
					)}
				/>
			</form>
			{result && (
				<>
					<h3>Résultat :</h3>
					<pre>{JSON.stringify(result, null, 2)}</pre>
				</>
			)}
		</div>
	);
}

const useStyles = tss.withName(Home.name).create({
	main: {
		marginTop: fr.spacing("6v"),
	},
});

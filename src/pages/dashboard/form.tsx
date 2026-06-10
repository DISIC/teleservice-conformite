import { fr } from "@codegouvfr/react-dsfr";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { tss } from "tss-react";
import { PathPicker } from "~/components/declaration/creation/PathPicker";
import { useCommonStyles } from "~/components/ui/commonStyles";
import { auth } from "~/lib/auth";
import { useStyles as useAppStyles } from "~/pages/_app";
import type { Entity } from "~/payload/payload-types";

export default function FormPage({ entity }: { entity: Entity | null }) {
	const { classes, cx } = useStyles();
	const { classes: appClasses } = useAppStyles();
	const { classes: commonClasses } = useCommonStyles();
	const { push } = useRouter();

	const onCreated = (declarationId: number) =>
		push(`/dashboard/declarations/${declarationId}`);

	return (
		<section className={fr.cx("fr-container")}>
			<div className={appClasses.formContainer}>
				<h1>Créer une déclaration</h1>
				<div className={classes.formWrapper}>
					<div className={cx(commonClasses.whiteBackground, fr.cx("fr-p-8v"))}>
						<p className={cx(classes.description, fr.cx("fr-text--sm"))}>
							Tous les champs sont obligatoires sauf précision contraire
						</p>
						<PathPicker entity={entity} onCreated={onCreated} />
					</div>
				</div>
			</div>
		</section>
	);
}

const useStyles = tss.withName(FormPage.name).create({
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
	},
	description: {
		color: fr.colors.decisions.text.mention.grey.default,
		margin: 0,
		marginBottom: fr.spacing("10v"),
		fontWeight: 400,
	},
});

export const getServerSideProps: GetServerSideProps = async (context) => {
	const [payload, authSession] = await Promise.all([
		getPayload({ config }),
		auth.api.getSession({
			headers: new Headers(context.req.headers as HeadersInit),
		}),
	]);

	if (!authSession) {
		return { redirect: { destination: "/" }, props: {} };
	}

	try {
		const user = await payload.findByID({
			collection: "users",
			id: authSession?.user?.id,
			depth: 3,
		});

		return {
			props: {
				entity: user?.entity || null,
			},
		};
	} catch (error) {
		console.error("Error fetching declaration:", error);

		return {
			redirect: { destination: "/dashboard" },
			props: {},
		};
	}
};

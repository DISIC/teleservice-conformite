import type { ParsedUrlQuery } from "node:querystring";
import { fr } from "@codegouvfr/react-dsfr";
import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	Redirect,
} from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { tss } from "tss-react";
import { Loader } from "~/components/system/Loader";
import { api } from "~/utils/api";

export default function AcceptInvite({
	token,
	declarationId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes } = useStyles();
	const router = useRouter();

	const { isSuccess } = api.accessRight.validateInvite.useQuery({ token });

	useEffect(() => {
		if (isSuccess) router.push(`/declaration/${declarationId}`);
	}, [isSuccess]);

	return (
		<section id="declarations-page" className={classes.main}>
			<h1>Invitation en cours de vérification</h1>
			<Loader loadingMessage="Vérification de l'invitation..." />
		</section>
	);
}

const useStyles = tss.withName(AcceptInvite.name).create({
	main: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("8v"),
		padding: fr.spacing("10v"),
	},
});

interface Params extends ParsedUrlQuery {
	token: string;
	declarationId: string;
}

export const getServerSideProps = (async (context) => {
	const { token, declarationId } = context.query as Params;

	const redirect: Redirect = {
		destination: "/declarations",
		permanent: false,
	};

	if (
		!token ||
		typeof token !== "string" ||
		!declarationId ||
		typeof declarationId !== "string"
	) {
		return { redirect };
	}

	return {
		props: {
			token,
			declarationId: Number.parseInt(declarationId, 10),
		},
	};
}) as GetServerSideProps<{ token: string; declarationId: number }>;

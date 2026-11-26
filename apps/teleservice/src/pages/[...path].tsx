import type { GetServerSideProps } from "next";
import {
	NotFoundPage,
	type NotFoundProps,
} from "~/components/layout/NotFoundPage";
import { notFoundResponse, readPageSession } from "~/lib/server-guards";

export default NotFoundPage;

export const getServerSideProps: GetServerSideProps<NotFoundProps> = async (
	context,
) => notFoundResponse(context, "page", !!(await readPageSession(context)));

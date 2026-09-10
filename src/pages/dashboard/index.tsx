import type { GetServerSideProps } from "next";

// `/dashboard` stays the auth landing URL; the list lives at `/dashboard/declarations`.
export const getServerSideProps: GetServerSideProps = async () => ({
	redirect: { destination: "/dashboard/declarations", permanent: false },
});

export default function DashboardPage() {
	return null;
}

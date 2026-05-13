import { Pagination as DsfrPagination } from "@codegouvfr/react-dsfr/Pagination";

type Props = {
	count: number;
	page: number;
	onPageChange: (page: number) => void;
	showFirstLast?: boolean;
	className?: string;
};

export const Pagination = (props: Props) => {
	const { count, page, onPageChange, showFirstLast = true, className } = props;

	if (count <= 1) return null;

	return (
		<DsfrPagination
			count={count}
			defaultPage={page}
			showFirstLast={showFirstLast}
			className={className}
			getPageLinkProps={(pageNumber) => ({
				href: "#",
				onClick: (e) => {
					e.preventDefault();
					onPageChange(pageNumber);
				},
			})}
		/>
	);
};

export default Pagination;

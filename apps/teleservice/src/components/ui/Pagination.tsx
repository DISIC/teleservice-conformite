import { fr } from "@codegouvfr/react-dsfr";
import { Pagination as DsfrPagination } from "@codegouvfr/react-dsfr/Pagination";
import { tss } from "tss-react";

type Props = {
	count: number;
	page: number;
	onPageChange: (page: number) => void;
	showFirstLast?: boolean;
	className?: string;
	numberPerPage: number;
};

export const Pagination = (props: Props) => {
	const {
		count,
		page,
		onPageChange,
		showFirstLast = true,
		className,
		numberPerPage,
	} = props;

	const { classes, cx } = useStyles();

	if (count <= 1) return null;

	return (
		<div className={cx(classes.root, className)}>
			<span className={classes.count}>{numberPerPage} lignes</span>
			<DsfrPagination
				count={count}
				defaultPage={page}
				showFirstLast={showFirstLast}
				getPageLinkProps={(pageNumber) => ({
					href: "#",
					onClick: (e) => {
						e.preventDefault();
						onPageChange(pageNumber);
					},
				})}
			/>
		</div>
	);
};

const useStyles = tss.withName("Pagination").create(() => ({
	root: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: fr.spacing("2v"),
		position: "relative",
	},
	count: {
		color: fr.colors.decisions.text.mention.grey.default,
		fontSize: "0.875rem",
		alignSelf: "self-start",
		marginTop: "0.325rem",
	},
}));

export default Pagination;

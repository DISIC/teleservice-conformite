import { fr } from "@codegouvfr/react-dsfr";
import {
	Table as DsfrTable,
	type TableProps,
} from "@codegouvfr/react-dsfr/Table";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	type RowData,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useState } from "react";
import { tss } from "tss-react";
import { Pagination } from "./Pagination";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		styles?: CSSProperties;
		noRowLink?: boolean;
	}
}

type Props<TData> = {
	columns: ColumnDef<TData, any>[];
	data: TData[];
	caption?: ReactNode;
	noCaption?: boolean;
	bordered?: boolean;
	fixed?: boolean;
	noScroll?: boolean;
	bottomCaption?: boolean;
	colorVariant?: TableProps["colorVariant"];
	className?: string;
	numberPerPage: number;
	hideHeaders?: boolean;
	getRowHref?: (row: TData) => string | undefined;
	tableOptions?: Partial<
		Omit<TableOptions<TData>, "data" | "columns" | "getCoreRowModel">
	>;
};

export const Table = <TData,>(props: Props<TData>) => {
	const {
		columns,
		data,
		caption,
		noCaption = !caption,
		bordered = true,
		fixed,
		noScroll,
		bottomCaption,
		colorVariant,
		className,
		numberPerPage,
		hideHeaders,
		tableOptions,
		getRowHref,
	} = props;

	const { classes, cx } = useStyles();

	const enablePagination = data.length > numberPerPage;

	const [pageIndex, setPageIndex] = useState(0);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...tableOptions,
		...(enablePagination
			? {
					getPaginationRowModel: getPaginationRowModel(),
					state: {
						...tableOptions?.state,
						pagination: { pageIndex, pageSize: numberPerPage },
					},
					onPaginationChange: (updater) => {
						const next =
							typeof updater === "function"
								? updater({ pageIndex, pageSize: numberPerPage })
								: updater;
						setPageIndex(next.pageIndex);
					},
				}
			: {}),
	});

	const pageCount = enablePagination ? table.getPageCount() : 0;

	const headers: ReactNode[] | undefined = hideHeaders
		? undefined
		: table.getHeaderGroups().flatMap((group) =>
				group.headers.map((header) => {
					if (header.isPlaceholder) return null;
					return (
						<div
							key={header.id}
							className={classes.headerCell}
							style={{ ...header.column.columnDef.meta?.styles }}
						>
							{flexRender(header.column.columnDef.header, header.getContext())}
						</div>
					);
				}),
			);

	const rows: ReactNode[][] = table.getRowModel().rows.map((row) => {
		const href = getRowHref?.(row.original);
		return row.getVisibleCells().map((cell) => {
			const cellNode = flexRender(
				cell.column.columnDef.cell,
				cell.getContext(),
			);
			const noRowLink = cell.column.columnDef.meta?.noRowLink;
			return (
				<div
					key={cell.id}
					className={cx(classes.bodyCell, href && classes.bodyCellLinked)}
					style={{ ...cell.column.columnDef.meta?.styles }}
					data-subrow={row.depth > 0 || undefined}
				>
					{href && !noRowLink ? (
						<Link href={href} className={classes.rowLink}>
							{cellNode}
						</Link>
					) : (
						cellNode
					)}
				</div>
			);
		});
	});

	return (
		<>
			<DsfrTable
				headers={headers}
				data={rows}
				caption={caption}
				noCaption={noCaption}
				bordered={bordered}
				fixed={fixed}
				noScroll={noScroll}
				bottomCaption={bottomCaption}
				colorVariant={colorVariant}
				className={cx(
					classes.table,
					hideHeaders && classes.hiddenHeaders,
					getRowHref && classes.tableWithRowLink,
					className,
				)}
			/>
			{enablePagination && (
				<div className={classes.paginationWrapper}>
					<Pagination
						count={pageCount}
						page={pageIndex + 1}
						numberPerPage={numberPerPage}
						onPageChange={(page) => setPageIndex(page - 1)}
					/>
				</div>
			)}
		</>
	);
};

const useStyles = tss.withName(Table.name).create(() => ({
	table: {
		marginTop: "0!important",
		marginBottom: "0!important",
		table: {
			display: "table",
		},
		thead: {
			backgroundColor: "white!important",
			backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default})!important`,
		},
		"tbody tr:has([data-subrow]) > td": {
			backgroundColor: fr.colors.decisions.background.default.grey.hover,
			backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default})!important`,
			backgroundSize: "100% 1px",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "top",
		},
		"tbody tr:not(:has([data-subrow])) + tr:has([data-subrow]) > td": {
			backgroundImage: "none!important",
		},
		"thead::after, tbody::after": {
			backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default}), linear-gradient(0deg, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default}), linear-gradient(0deg, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default})!important`,
		},
	},
	headerCell: {
		minWidth: "max-content",
	},
	bodyCell: {
		display: "flex",
		alignItems: "center",
	},
	bodyCellLinked: {
		padding: "0 !important",
		"& > a, & > div": {
			width: "100%",
		},
	},
	tableWithRowLink: {
		"tbody tr": {
			cursor: "pointer",
		},
		"tbody tr:hover > td": {
			backgroundColor: `${fr.colors.decisions.background.default.grey.hover} !important`,
			boxShadow: `inset 0 -1px 0 ${fr.colors.decisions.border.default.grey.default}`,
		},
		"tbody td:has(> div > a)": {
			padding: "0 !important",
		},
		"tbody td a, tbody td a:hover, tbody td a:focus, tbody td a:active": {
			backgroundColor: "transparent !important",
		},
	},
	rowLink: {
		display: "flex",
		alignItems: "center",
		width: "100%",
		padding: `${fr.spacing("3v")} ${fr.spacing("4v")}`,
		color: "inherit",
		textDecoration: "none",
		backgroundImage: "none",
		backgroundColor: "transparent",
		fontWeight: "inherit",
		"&:hover, &:focus, &:active, &:focus-visible, &:focus-within": {
			backgroundColor: "transparent",
			backgroundImage: "none",
		},
	},
	hiddenHeaders: {
		"tbody tr:first-of-type td": {
			borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		},
		"tbody tr:last-of-type td": {
			borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		},
	},
	paginationWrapper: {
		display: "flex",
		justifyContent: "center",
		marginTop: fr.spacing("4v"),
	},
}));

export default Table;

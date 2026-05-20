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
import { type CSSProperties, type ReactNode, useState } from "react";
import { tss } from "tss-react";
import { Pagination } from "./Pagination";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		styles?: CSSProperties;
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

	const rows: ReactNode[][] = table.getRowModel().rows.map((row) =>
		row.getVisibleCells().map((cell) => {
			return (
				<div
					key={cell.id}
					className={classes.bodyCell}
					style={{ ...cell.column.columnDef.meta?.styles }}
					data-subrow={row.depth > 0 || undefined}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</div>
			);
		}),
	);

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

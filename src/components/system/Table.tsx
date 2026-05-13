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
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { type ReactNode, useState } from "react";
import { tss } from "tss-react";
import { Pagination } from "./Pagination";

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
		tableOptions,
	} = props;

	const { classes, cx } = useStyles();

	const enablePagination = data.length > numberPerPage;

	const [pageIndex, setPageIndex] = useState(0);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...(enablePagination
			? {
					getPaginationRowModel: getPaginationRowModel(),
					state: {
						pagination: { pageIndex, pageSize: numberPerPage },
						...tableOptions?.state,
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
		...tableOptions,
	});

	const pageCount = enablePagination ? table.getPageCount() : 0;

	const headers: ReactNode[] = table.getHeaderGroups().flatMap((group) =>
		group.headers.map((header) =>
			header.isPlaceholder ? null : (
				<div key={header.id} className={classes.headerCell}>
					{flexRender(header.column.columnDef.header, header.getContext())}
				</div>
			),
		),
	);

	const rows: ReactNode[][] = table.getRowModel().rows.map((row) =>
		row.getVisibleCells().map((cell) => (
			<div key={cell.id} className={classes.bodyCell}>
				{flexRender(cell.column.columnDef.cell, cell.getContext())}
			</div>
		)),
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
				className={cx(classes.table, className)}
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
		marginTop: `${fr.spacing("6v")}!important`,
		marginBottom: "0!important",
		table: {
			borderColor: "red!important",
			display: "table",
		},
		thead: {
			backgroundColor: "white!important",
			backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.default.grey.default}, ${fr.colors.decisions.border.default.grey.default})!important`,
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
	paginationWrapper: {
		display: "flex",
		justifyContent: "center",
		marginTop: fr.spacing("4v"),
	},
}));

export default Table;

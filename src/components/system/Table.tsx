import { fr } from "@codegouvfr/react-dsfr";
import {
	Table as DsfrTable,
	type TableProps,
} from "@codegouvfr/react-dsfr/Table";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { tss } from "tss-react";

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
		tableOptions,
	} = props;

	const { classes, cx } = useStyles();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		...tableOptions,
	});

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
}));

export default Table;

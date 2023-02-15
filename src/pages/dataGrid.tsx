import * as React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
// import { useResizeColumns, useTable, UseTableInstanceProps } from "react-table";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: "tanner",
    lastName: "linsley",
    age: 24,
    visits: 100,
    status: "In Relationship",
    progress: 50,
  },
  {
    firstName: "tandy",
    lastName: "miller",
    age: 40,
    visits: 40,
    status: "Single",
    progress: 80,
  },
  {
    firstName: "joe",
    lastName: "dirte",
    age: 45,
    visits: 20,
    status: "Complicated",
    progress: 10,
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("firstName", {
    id: "firstName",
    cell: (info) => info.getValue(),
    header: "First Name",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: "lastName",
    cell: (info) => <i>{info.getValue()}</i>,
    header: "Last Name",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("age", {
    id: "age",
    header: "Age",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("visits", {
    id: "visits",
    header: "Visits",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("progress", {
    id: "progress",
    header: "Profile Progress",
    footer: (info) => info.column.id,
  }),
];


function handleSetData() {
  dataGridResize();
}

export function DataGrid() {
  // @ts-ignore
  const [data, setData] = React.useState(() => [...defaultData]);
  const rerender = React.useReducer(() => ({}), {})[1];
  React.useEffect(() => {
    // This code will run after the component has mounted.
    handleSetData();
  }, []);

  // make the grid column lengths resizable
  // const [headers, setHeaders] = React.useState<{Headers: any}>([]);
  const table = useReactTable(
    {
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    }
  );

  const propertyNames = Object.keys(data[0]);

  return (
    <div className={styles["dataGridhtml"]}>
      <i id="ruler" hidden></i>
      <table id={"gridjs_0"} className={styles["dataGridtable"]}>
        <thead>
          {table.getHeaderGroups().map((headerGroup, value) => (
            <tr key={`${headerGroup.id}${value}`}>
              {headerGroup.headers.map((header, value: number) => (
                <th key={`${header.id}${value}`} className={styles["dataGridth"]} data-column-id={columns[value].header} scope="col">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                <div className={styles["columndivider"]}></div></th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={styles["dataGridtbody"]}>
          {table.getRowModel().rows.map((row) => (
            <tr key={`${row.id}`} className="gridjs-tr">
              {row.getVisibleCells().map((cell, value: number) => (
                <td key={cell.id} className={styles["dataGridtd"]} data-column-id={columns[value].header}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className={styles["dataGridtfoot"]}>
          {table.getFooterGroups().map((footerGroup, value: number) => (
            <tr key={`${footerGroup.id}${value}`}>
              {footerGroup.headers.map((header) => (
                <th key={`${header.id}${value}`} data-column-id={columns[value].header}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
    </div>
  );
}
import * as React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { FinVendorEtl, getVendors, vendorProperties } from "./api/getVendors";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

function handleSetData() {
  dataGridResize();
}

  export function DataGrid() {
    const [data, setData] = React.useState<FinVendorEtl[]>([]);

    React.useEffect(() => {
      async function fetchData() {
        const response = await getVendors();
        setData(response);
      }
      fetchData();
    }, []);

    const handleButtonClick = () => {
      async function fetchData() {
        const response = await getVendors();
        setData(response);
      }
      fetchData();
    };

    const columns: ColumnDef<FinVendorEtl>[] = Object.keys(vendorProperties).map((key, value) => {
      return {
        header: key,
        accessor: value,
      };
    });

    const vendorsColumns = React.useMemo(() => {
      return Object.keys(vendorProperties).map((key, value) => {
        return {
          header: key,
          accessor: value,
        };
      });
    }, []);

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      debugTable: true,
      debugHeaders: true,
      debugColumns: true,
    });

    React.useEffect(() => {
      handleSetData()
    });

    return (
      <div className={styles["dataGridhtml"]}>
        <div className="h-4" />
        <button onClick={handleButtonClick} className="border p-2">
          Get Vendors
        </button>
        <i id="ruler" hidden></i>
        <table id={"gridjs_0"} className={styles["dataGridtable"]}>
          <thead>
            {table.getHeaderGroups().map((headerGroup, value) => (
              <tr key={`${headerGroup.id}${value}`}>
                {headerGroup.headers.map((header, value: number) => (
                  <th
                    key={`${header.id}${value}`}
                    className={styles["dataGridth"]}
                    data-column-id={vendorsColumns[value]}
                    scope="col"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <div className={styles["columndivider"]}></div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={styles["dataGridtbody"]}>
            {table.getRowModel().rows.map((row) => (
              <tr key={`${row.id}`} className={styles["gridjs-tr"]}>
                {row.getVisibleCells().map((cell, value: number) => (
                  <td
                    key={cell.id}
                    className={styles["dataGridtd"]}
                    data-column-id={vendorsColumns[value].header}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

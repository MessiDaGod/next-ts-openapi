import React from "react";

// import {
//   ColumnResizeMode,
// } from "@tanstack/react-table";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { FinVendorEtl } from "./api/FinVendorEtl";
import { getVendors, vendorProperties } from "./api/getVendors";
import { GenerateDefaultColumns, Columns } from "./api/defaultColumnGenerator";
// import CodeEditor from "./codeEditor";

function handleSetData() {
  dataGridResize();
}

const defaultColumns: Columns<FinVendorEtl>[] =
  GenerateDefaultColumns<FinVendorEtl>(vendorProperties);

export function DataGrid() {
  const [data, setData] = React.useState<FinVendorEtl[]>([]);
  const [columns] = React.useState<typeof defaultColumns>(() => [
    ...defaultColumns,
  ]);
  // const [columnResizeMode, setColumnResizeMode] =
  //   React.useState<ColumnResizeMode>("onChange");

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

  React.useEffect(() => {
    handleSetData();
  });

  function generateTableFromFinVendorEtlObject() {
    const tableRows = [
      columns.map((columnName) => (
        <th
        key={columnName.name}
        className={styles["dataGridth"]}
        data-column-id={columnName.displayName}
        >
          {columnName.displayName}
          <div className={styles["columndivider"]}></div>
        </th>
      )),
      ...data.map((row) => (
        <tr key={row.Id} className={styles["gridjs-tr"]}>
          {Object.keys(row).map((key) => (
            <td key={`${key}_${row.Id}`} className={styles["dataGridtd"]}>{row[key]}</td>
          ))}
        </tr>
      )),
    ];

    return (
      <table id={"gridjs_0"} className={styles["dataGridtable"]}>
        <thead>
          <tr>{tableRows[0]}</tr>
        </thead>
        <tbody>{tableRows.slice(1)}</tbody>
      </table>
    );
  }
  const table = generateTableFromFinVendorEtlObject();

  return (
    <div className={styles["dataGridhtml"]}>
      <i id="ruler" hidden></i>
      <div className="h-4" />
      <button onClick={handleButtonClick}>Get Vendors</button>
      <i id="ruler" hidden></i>
      {table}
      {/* <CodeEditor
        initialValue={JSON.stringify(defaultColumns, null, 2)}
        language="json"
        height="30vh"
      /> */}
    </div>
  );

  // return (
  //   <div className={styles["dataGridhtml"]}>
  //     <div className="h-4" />
  //     <button onClick={handleButtonClick} className="border p-2">
  //       Get Vendors
  //     </button>
  //     <select
  //     value={columnResizeMode}
  //     onChange={e => setColumnResizeMode(e.target.value as ColumnResizeMode)}
  //     className="border p-2 border-black rounded"
  //   >
  //     <option value="onEnd">Resize: &quot;onEnd&quot;</option>
  //     <option value="onChange">Resize: &quot;onChange&quot;</option>
  //   </select>
  //     <i id="ruler" hidden></i>
  //     <table id={"gridjs_0"} className={styles["dataGridtable"]}>
  //     <thead>
  //         {table.getHeaderGroups().map((headerGroup, iHeaderGroup: number) => (
  //           <tr>
  //             {headerGroup.headers.map((header, iHeader: number) => (
  //               <th
  //                 key={`${iHeaderGroup}`}
  //                 className={styles["dataGridth"]}
  //                 data-column-id={headerGroup.headers[iHeader].id}
  //                 aria-label={headerGroup.headers[iHeader].id}
  //                 scope="col"
  //               >
  //                 {header.isPlaceholder
  //                   ? null
  //                   : flexRender(
  //                       header.column.columnDef.header,
  //                       header.getContext()
  //                     )}
  //                 <div className={styles["columndivider"]}></div>
  //               </th>
  //             ))}
  //           </tr>
  //         ))}
  //       </thead>
  //       <tbody>
  //         {table.getRowModel().rows.map(row => (
  //           <tr key={row.id} className={styles["gridjs-tr"]}>
  //             {row.getVisibleCells().map(cell => (
  //               <td
  //                 {...{
  //                   key: cell.id,
  //                   style: {
  //                     width: cell.column.getSize(),
  //                   },
  //                 }}
  //               >
  //                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
  //               </td>
  //             ))}
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //    <CodeEditor initialValue={JSON.stringify(defaultColumns, null, 2)} language="json" height="30vh"/>
  //   </div>
  // );
}

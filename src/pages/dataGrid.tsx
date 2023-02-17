import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { FinVendorEtl } from "./api/Objects/FinVendorEtl";
import { getVendors, vendorProperties } from "./api/getVendors";
import { GenerateDefaultColumns, Columns } from "./api/defaultColumnGenerator";
import SimpleDropdown from "./simpleDropdown";
import { DataObjectWithColumnsAndValues } from "./api/DataObject";

function handleSetData() {
  DataObjectWithColumnsAndValues;
  dataGridResize();
}

const defaultColumns: Columns<FinVendorEtl>[] =
  GenerateDefaultColumns<FinVendorEtl>(vendorProperties);

export function DataGrid() {
  const [data, setData] = React.useState<FinVendorEtl[]>([]);
  // const [columns] = React.useState<typeof defaultColumns>(() => [
  //   ...defaultColumns,
  // ]);

  React.useEffect(() => {
    async function fetchData() {
      const response = await getVendors();
      setData(response);
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    handleSetData();
  });


  function generateTableFromObject() {
    const tableRows = [
      defaultColumns.map((columnName, idx) => (
        <th
          key={`${columnName.name}${idx}`}
          className={styles["dataGridth"]}
          data-column-id={columnName.name}
          hidden={isColumnHidden(columnName.name)}
        >
          {columnName.displayName}
          <div
            key={`div${columnName}${idx}`}
            className={`${styles["columndivider"]}`}
          ></div>
        </th>
      )),
      ...data
        .filter((row) => !isRowEmpty(row))
        .map((row) => (
          <tr key={row.Id} className={styles["gridjs-tr"]}>
            {Object.entries(row).map(([key, value]) => (
              <td
                key={`${key}_${row.Id}`}
                className={styles["dataGridtd"]}
                data-column-id={key}
                hidden={isColumnHidden(key)}
              >
                {value}
              </td>
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

  const table = generateTableFromObject();

  return (
    <>
      <div className={styles["dataGridhtml"]}>
        <i id="ruler" hidden></i>
        <div className="h-4" />
        <SimpleDropdown jsonFileName="GetOptions" label="Get" />
        <i id="ruler" hidden></i>
        {table}
      </div>
    </>
  );

  function isRowEmpty<T>(row: T): boolean {
    if (!row) return true;
    return Object.values(row).every((value) => value === null || value === "" || value === "null");
  }

  function isColumnHidden(columnName: string): boolean {
    const columnData = data.map((row) => row[columnName]);
    return columnData.every((value) => value === null || value === "");
  }
}

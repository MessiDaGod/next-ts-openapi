import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { FinVendorEtl } from "./api/FinVendorEtl";
import { getVendors, vendorProperties } from "./api/getVendors";
import { GenerateDefaultColumns, Columns } from "./api/defaultColumnGenerator";

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
      columns.map((columnName, idx) => (
        <th
          key={`${columnName}${idx}`}
          className={styles["dataGridth"]}
          data-column-id={columnName.name}
        >
          {columnName.displayName}
          <div key={`div${columnName}${idx}`}
          className={`${styles['columndivider']}`}
        ></div>
        </th>
      )),
      ...data.map((row) => (
        <tr key={row.Id} className={styles["gridjs-tr"]}>
          {Object.entries(row).map(([key, value]) => (
            <td
              key={`${key}_${row.Id}`}
              className={styles["dataGridtd"]}
              data-column-id={key}
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


  const table = generateTableFromFinVendorEtlObject();

  return (
    <>
    <div className={styles["dataGridhtml"]}>
      <i id="ruler" hidden></i>
      <div className="h-4" />
      <button onClick={handleButtonClick}>Get Vendors</button>
      <i id="ruler" hidden></i>
      {table}
    </div>
    </>
  );

}

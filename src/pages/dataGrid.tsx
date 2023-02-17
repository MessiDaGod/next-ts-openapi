import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { Vendor, vendorProperties, emptyVendor } from "./api/Objects/Vendor";
// import { PropOptions, propOptionProperties } from "./api/Objects/PropOptions";
import { getVendors } from "./api/getVendors";
import { GenerateDefaultColumns } from "./api/DataObject";
import {
  GetDataDictionary,
  DataObjectWithColumnsAndValues,
} from "./api/DataObject";
// import SimpleDropdown from "./simpleDropdown";
// import { DataObjectWithColumnsAndValues } from "./api/DataObject";

function handleSetData() {
  dataGridResize();
}

export function DataGrid() {
  const [data, setData] = React.useState<Vendor | Vendor[]>([]);
  // const [columns] = React.useState<typeof DataDictionary>(() => [
  //   ...vendorProperties,
  // ]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getVendors();
        setData(response);
      } catch (error) {
        return emptyVendor;
      }
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    handleSetData();
  });

  function GenerateVendorData(
    data: Vendor | Vendor[]
  ): DataObjectWithColumnsAndValues<Vendor> | undefined {
    const json = JSON.stringify(data);
    const vendors: Vendor[] = JSON.parse(json).map((vendor: Vendor) => ({
      ...vendor,
    }));

    if (vendors.length > 0) {
      const newVendors = GetDataDictionary(vendors);
      if (newVendors.columns.length > 0) {
        newVendors.columns.forEach((column) => {
          const columnName = column.name;
          console.log(columnName);
          const columnValues = newVendors.values[columnName].Values;
          console.log(`${columnValues}`);
        });
      }
      return newVendors;
    }
  }

  function GenerateTable() {
    if (Array.isArray(data)) {
      const newVendors = GenerateVendorData(data);
      if (!newVendors) return;
      const tableColumns = [
        newVendors.columns.map(
          (columnName, idx) => (
            <th
              id={`${columnName.name}${idx}`}
              key={`${columnName.name}${idx}`}
              className={styles["dataGridth"]}
              data-column-id={columnName.name}
              // hidden={isColumnHidden(columnName.name)}
            >
              {columnName.displayName}
              <div
                key={`div${columnName}${idx}`}
                className={`${styles["columndivider"]}`}
              ></div>
            </th>
          )
          //   <tr key={row.Id} className={styles["gridjs-tr"]}>
          //   {Object.entries(row).map(([key, value]) => (
          //     <td
          //       key={`${key}_${row.Id}`}
          //       className={styles["dataGridtd"]}
          //       data-column-id={key}
          //       // hidden={isColumnHidden(key)}
          //     >
          //       {value}
          //     </td>
          //   ))}
          // </tr>
        ),
      ];

      if (tableColumns.length > 0) {
        return (
          <table id={"gridjs_0"} className={styles["dataGridtable"]}>
            <thead>
              <tr>{tableColumns[0]}</tr>
            </thead>
            <tbody>{tableColumns.slice(1)}</tbody>
          </table>
        );
      }
    }
  }

  // const table = generateTableFromObject();
  const table = GenerateTable();

  if (table) {
    return (
      <>
        <div className={styles["dataGridhtml"]}>
          <i id="ruler" hidden></i>
          <div className="h-4" />
          <i id="ruler" hidden></i>
          {table}
        </div>
      </>
    );
  }

  function generateTableFromObject() {
    if (Array.isArray(data)) {
      const newVendors = GenerateVendorData(data);
      if (!newVendors) return;
      const tableRows = [
        newVendors.columns.map((columnName, idx) => (
          <th
            key={`${columnName.name}${idx}`}
            className={styles["dataGridth"]}
            data-column-id={columnName.name}
            // hidden={isColumnHidden(columnName.name)}
          >
            {columnName.displayName}
            <div
              key={`div${columnName}${idx}`}
              className={`${styles["columndivider"]}`}
            ></div>
          </th>
        )),
        ...data
          // .filter((row) => !isRowEmpty(row))
          .map((row) => (
            <tr key={row.Id} className={styles["gridjs-tr"]}>
              {Object.entries(row).map(([key, value]) => (
                <td
                  key={`${key}_${row.Id}`}
                  className={styles["dataGridtd"]}
                  data-column-id={key}
                  // hidden={isColumnHidden(key)}
                >
                  {value}
                </td>
              ))}
            </tr>
          )),
      ];

      if (tableRows.length > 0) {
        return (
          <table id={"gridjs_0"} className={styles["dataGridtable"]}>
            <thead>
              <tr>{tableRows[0]}</tr>
            </thead>
            <tbody>{tableRows.slice(1)}</tbody>
          </table>
        );
      }
    }
  }

  function isRowEmpty<T>(row: T): boolean {
    if (!row) return true;
    return Object.values(row).every(
      (value) => value === null || value === "" || value === "null"
    );
  }

  function isColumnHidden(columnName: string): boolean {
    if (Array.isArray(data)) {
      const columnData = data.map((row) => row[columnName]);
      return columnData.every((value) => value === null || value === "");
    } else {
      return true;
    }
  }

  function isAnyCellValueHidden(dataColId: string): boolean {
    const elements = document.getElementsByTagName(dataColId);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (
        element instanceof HTMLElement &&
        element.dataset.columnId === "something" &&
        !element.offsetParent
      ) {
        return true;
      }
    }
    return false;
  }
}

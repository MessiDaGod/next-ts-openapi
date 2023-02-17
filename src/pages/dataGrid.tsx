import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { Vendor, emptyVendor } from "./api/Objects/Vendor";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable } from "./api/DataObject";

function handleSetData() {
  dataGridResize();
}

export function DataGrid() {
  const [data, setData] = React.useState<Vendor | Vendor[]>([]);
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

  function GenerateVendorData(data: Vendor | Vendor[]): DataTable<Vendor> | undefined {
    const json = JSON.stringify(data);
    const vendors: Vendor[] = JSON.parse(json).map((vendor: Vendor) => ({
      ...vendor,
    }));

    if (vendors.length > 0) {
      const newVendors = GetDataDictionary(vendors);
      vendors.forEach((vendor) => {
        Object.entries(vendor).forEach(([key, value]) => {
          newVendors.values[key].Values.push(value);
        });
      });

      return newVendors;
    }
  }

  function handleSort(columnName: string) {
    if (Array.isArray(data)) {
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[columnName];
        const bValue = b[columnName];
        if (aValue < bValue) {
          return -1;
        } else if (aValue > bValue) {
          return 1;
        } else {
          return 0;
        }
      });
      setData(sortedData);
    }
  }

  function GenerateTableHtml() {
    if (Array.isArray(data)) {
      const newVendors = GenerateVendorData(data);
      if (!newVendors) return;
      const tableRows = [
        newVendors.columns.map((columnName, idx) => (
          <th
            key={`${columnName.name}${idx}`}
            className={styles["dataGridth"]}
            data-column-id={columnName.name}
            hidden={isColumnHidden(columnName.keyName)}
          >
            {columnName.displayName}
            <div
              key={`div${columnName}${idx}`}
              className={`${styles["columndivider"]}`}
            >
              <button onClick={() => handleSort(columnName.keyName)}>
                Sort
              </button>
            </div>
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

  const table = GenerateTableHtml();

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

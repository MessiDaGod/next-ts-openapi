import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { Vendor, emptyVendor } from "./api/Objects/Vendor";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable } from "./api/DataObject";
import { Pagination } from "./pagination";

function handleSetData() {
  dataGridResize();
}

interface Props {

}
const DataGrid: React.FC<Props> = (name) => {
  const [data, setData] = React.useState<Vendor | Vendor[]>([]);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  // const [itemsPerPage, setItemsPerPage] = React.useState<number>(25);

  const itemsPerPage = 25;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = Array.isArray(data)
    ? data.slice(startIndex, endIndex)
    : [];

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getVendors(1000);
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
  ): DataTable<Vendor> | undefined {
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
    let state = sortState;
    if (Array.isArray(data)) {
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[columnName];
        const bValue = b[columnName];
        if (state) {
          if (aValue < bValue) {
            return 1;
          } else if (aValue > bValue) {
            return -1;
          } else {
            return 0;
          }
        }
        if (aValue < bValue) {
          return -1;
        } else if (aValue > bValue) {
          return 1;
        } else {
          return 0;
        }
      });
      setData(sortedData);
      setSortState(!state);
      setCurrentPage(1);
    }
  }

  function GenerateTableHtml() {
    if (Array.isArray(data)) {
      const newVendors = GenerateVendorData(data);
      if (!newVendors) return;

      // Pagination logic
      const totalItems = data.filter((row) => !isRowEmpty(row)).length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data
        .filter((row) => !isRowEmpty(row))
        .slice(startIndex, endIndex);

      const tableRows = [
        newVendors.columns.map((columnName, idx) => {
          const columnNames = columnName.displayName.split(" ");
          const columnNamesWithLineBreaks = columnNames.map((name) => (
            <React.Fragment key={name}>
              {name}
              <br />
            </React.Fragment>
          ));
          return (
            <th
              key={`${columnName.name}${idx}`}
              style={{ margin: "auto", cursor: "pointer" }}
              className={styles["dataGridth"]}
              data-column-id={columnName.name}
              hidden={isColumnHidden(columnName.keyName)}
            >
              <div
                key={`div${columnName}${idx}`}
                className={`${styles["columndivider"]}`}
              ></div>
              <span
                className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
                onClick={() => handleSort(columnName.keyName)}
                style={{
                  margin: "auto",
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                {!sortState ? "expand_more" : "expand_less"}
              </span>
              {columnNamesWithLineBreaks}
            </th>
          );
        }),
        ...data
          .filter((row) => !isRowEmpty(row))
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((row, rowIndex: number) => (
            <tr key={row.Id} className={styles["gridjs-tr"]}>
              {Object.entries(row).map(([key, value], index: number) => (
                <td
                  key={`${key}_${row.Id.toString()}_${rowIndex}_${index}`}
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

  if (table && Array.isArray(data) && data.length > 0) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
      <React.Fragment>
        <>
          <div className={styles["datagriddiv"]}>
            <i id="ruler" hidden></i>
            {table}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      </React.Fragment>
    );
  }

  function isRowEmpty<T>(row: T): boolean {
    if (!row) return true;
    return Object.values(row).every(
      (value) =>
        value === null ||
        value === "" ||
        value === "0" ||
        value === "-1" ||
        value === "0.000000" ||
        value === "NULL"
    );
  }

  function isColumnHidden(columnName: string): boolean {
    if (Array.isArray(data)) {
      const columnData = data.map((row) => row[columnName]);
      return columnData.every(
        (value) =>
          value === null ||
          value === "" ||
          value === "0" ||
          value === "-1" ||
          value === "0.000000" ||
          value === "NULL"
      );
    } else {
      return true;
    }
  }
}

export default DataGrid;
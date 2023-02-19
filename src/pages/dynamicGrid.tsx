import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable } from "./api/DataObject";
import { Pagination } from "../pagination";
import { Vendor } from "./api/Objects/Vendor";

function handleSetData() {
  dataGridResize();
}

function DynamicGrid<T>(myData: T[]) {
  const [data, setData] = React.useState<T[]>([]);
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
        console.log(typeof myData);
        const response = await getVendors(1000);
        const items = JSON.parse(JSON.stringify(response));
        setData(items);
      } catch (error) {
        return [];
      }
    }
    fetchData();
  }, [myData]);

  React.useEffect(() => {
    handleSetData();
  });

  function GenerateDynamicData(
    data: T | T[]
  ): DataTable<T> | undefined {
    const json = JSON.stringify(data);
    const dataSet: T[] = JSON.parse(json).map((vendor: T) => ({
      ...vendor,
    }));

    if (dataSet.length > 0) {
      const newItems = GetDataDictionary(dataSet);
    //   dataSet.forEach((item) => {
    //     Object.entries(item).forEach(([key, value]) => {
    //       newItems.values[key].Values.push(value);
    //     });
    //   });

      return newItems;
    }
  }


  function GenerateTableHtml() {
    if (Array.isArray(data)) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      // Pagination logic
      const totalItems = data.filter((row) => !isRowEmpty(row)).length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data
        .filter((row) => !isRowEmpty(row))
        .slice(startIndex, endIndex);

      const tableRows = [
        gridItems.columns.map((columnName, idx) => {
          const columnNames = columnName.displayName.split(" ");
          const columnNamesWithLineBreaks = columnNames.map((name) => (
            <React.Fragment key={name}>
              {name}
              <br />
            </React.Fragment>
          ));
          return (
            <th
              key={`${idx}`}
              style={{ margin: "auto", cursor: "pointer" }}
              className={styles["dataGridth"]}
              data-column-id={columnName.name}
            //   hidden={isColumnHidden(columnName.keyName)}
            >
              <div
                key={`div${columnName}${idx}`}
                className={`${styles["columndivider"]}`}
              ></div>
              <span
                className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
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
        //   .filter((row) => !isRowEmpty(row))
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((row, rowIndex: number) => (
            <tr key={rowIndex} className={styles["gridjs-tr"]}>
              {/* {Object.entries(row).map(([key, value], index: number) => (
                <td
                  key={`${key}_${row.Id.toString()}_${rowIndex}_${index}`}
                  className={styles["dataGridtd"]}
                  data-column-id={key}
                  hidden={isColumnHidden(key)}
                >
                  {value}
                </td>
              ))} */}
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
}

export default DynamicGrid;
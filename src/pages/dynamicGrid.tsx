import React from "react";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable } from "./api/DataObject";
import { Pagination } from "../pagination";
import { getPropOptions } from "./api/getPropOptions";
import { dataGridResize } from "./api/dataGridResize";
import { getAccounts } from "./api/getAccounts";
import styles from "../styles/Home.module.scss";

function DynamicGrid<T>(selectItem: string) {
  const [data, setData] = React.useState<T[]>([]);
  const [sortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 25;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        let response = [];
        switch (selectItem) {
          case "GetVendors":
            response = await getVendors(1000);
            setData(response);
            break;
          case "GetPropOptions":
            response = await getPropOptions(1000);
            setData(response);
            break;
          case "GetAccounts":
            response = await getAccounts(1000);
            setData(response);
            break;
        }
      } catch (error) {
        console.error(error);
      }
    }
    dataGridResize();
    fetchData();
  }, [selectItem]);

  const memoizedData = React.useMemo(() => GenerateDynamicData(data), [data]);

  function GenerateDynamicData(data: T | T[]): DataTable<T> | undefined {
    const json = JSON.stringify(data);
    const dataSet: T[] = JSON.parse(json).map((vendor: T) => ({
      ...vendor,
    }));

    if (dataSet.length > 0) {
      const newItems = GetDataDictionary(dataSet);
      console.log("generating dynamic data...");
      return newItems;
    }
  }

  function GenerateTableHtml() {
    if (Array.isArray(data)) {
      const gridItems = memoizedData;
      if (!gridItems) return;

      // Pagination logic

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
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((_row, rowIndex: number) => (
            <tr key={rowIndex} className={styles["gridjs-tr"]}>
              {Object.entries(_row).map(([key, value], index: number) => (
                <td
                  key={`${key}_${rowIndex}_${index}`}
                  className={styles["dataGridtd"]}
                  data-column-id={key}
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
}

export default DynamicGrid;

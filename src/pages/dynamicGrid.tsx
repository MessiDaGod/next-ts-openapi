import React from "react";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable } from "./api/DataObject";
import { Pagination } from "../pagination";
import { getPropOptions } from "./api/getPropOptions";
import { getAccounts } from "./api/getAccounts";
import styles from "../styles/Home.module.scss";
import { dataGridResize } from "./api/dataGridResize";

function DynamicGrid<T>(selectItem: string) {
  const [data, setData] = React.useState<T[]>([]);
  const [sortState, setSortState] = React.useState<boolean>(true);
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
            response = await getVendors(100);
            setData(response);
            break;
          case "GetPropOptions":
            response = await getPropOptions(100);
            setData(response);
            break;
          case "GetAccounts":
            response = await getAccounts(100);
            setData(response);
            break;
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [selectItem]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedData = React.useMemo(() => GenerateDynamicData(data), [data]);

  function GenerateDynamicData(data: T | T[]): DataTable<T> | undefined {
    if (!data) return;
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

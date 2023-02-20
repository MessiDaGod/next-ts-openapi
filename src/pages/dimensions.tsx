import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import axios from "axios";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import styles from "../styles/Home.module.scss";

const queryClient = new QueryClient();


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* @ts-ignore */}
      <Example />
    </QueryClientProvider>
  );
}

function Example<T>() {
  const [myData, setData] = React.useState<T[]>([]);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 25;
  const { isLoading, error, data, isFetching } = useQuery("repoData", () =>
    axios
      .get("https://localhost:5006/api/data/GetDimensions")
      .then((res) => res.data)
  );

  useEffect(() => {
    async function fetchData() {
      console.info(data);
      setData(data);
    }
    fetchData();
  }, [data, myData]);

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

  const memoizedData = React.useMemo(() => GenerateDynamicData(data), [myData]);

  function GenerateDynamicData<T>(myData: T | T[]): DataTable<T> | undefined {

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
                  {value as string}
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

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: ";

  return (
    <>
      <div>
        <h1>Dimensions</h1>
        <p>{Array.from(new Set(myData)).length}</p>
        {table}
        <div>{isFetching ? "Updating..." : ""}</div>
        <ReactQueryDevtools initialIsOpen />
      </div>
    </>
  );
}

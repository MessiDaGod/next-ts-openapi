import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import axios from "axios";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import styles from "../styles/Home.module.scss";
import { dataGridResize } from "./api/dataGridResize";
import { parseValue } from "./utils";
import { response } from "express";

const queryClient = new QueryClient();

interface DataSet {
  [key: number]: number | undefined;
  row: number | undefined;
  columnName: string | undefined;
  columnIndex: number | undefined;
  value: string | undefined;
  columnCount: number | undefined;
  rowCount: number | undefined;
}

function getGoodColumns(): Promise<string[]> {
  return fetch("/GoodColumns.json")
    .then((response) => response.json())
    .then((data) => data.map((item: any) => item.Name));
}

function GenerateDynamicData<T>(data: T[] | undefined): DataSet[] {
  if (!data) return;
  if (data.length === 0) return;
  const myDataSet: DataSet[] = [];

  const goodColumns = getGoodColumns();

  for (let i = 0; i < data.length; i++) {
    const values = Object.entries(data[i]);
    values.map((value, idx: number) => {
      myDataSet.push({
        row: i,
        columnName: value[0],
        columnIndex: idx,
        value: value[1] as string,
        columnCount: values.length,
        rowCount: data.length,
      });
    });
  }

  return myDataSet;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* @ts-ignore */}
      <Example />
    </QueryClientProvider>
  );
}

function Example<T>() {
  const [data, setData] = React.useState<T[]>([]);
  const [size, setSize] = React.useState<Boolean>(null);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 25;
  const { isLoading, error, isFetching } = useQuery("repoData", () =>
    axios
      .get("https://localhost:5006/api/data/GetDimensions")
      .then((res) => setData(res.data))
  );

  useEffect(() => {
    async function fetchData() {
      // console.info(data);
      setData(data);
      setSize(false);
    }
    fetchData();
  }, [data]);

  // useEffect(() => {
  //   async function handleListeners() {
  //     dataGridResize();
  //     setSize(true);
  //   }
  //   handleListeners();
  // }, [size]);

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
    if (Array.isArray(data) && data.length > 0) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      const columns = gridItems[0].columnCount;
      const tableRows = [
        gridItems.map((item, idx) => {
          if (idx > columns - 1) return;
          const columnNames = item.columnName.replaceAll("_", " ").split(" ");
          const columnNamesWithLineBreaks = columnNames.map((name, index) => (
            <React.Fragment key={name}>
              {name}
              <br />
            </React.Fragment>
          ));

          return (
            <><th
              key={`${idx}`}
              style={{ margin: "auto", cursor: "pointer" }}
              className={styles["dataGridth"]}
              data-column-id={item.columnName}
            >
              {columnNamesWithLineBreaks}
              <span
              className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
              onClick={() => handleSort(item.columnName)}
              style={{
                display: "flex",
                cursor: "pointer",
                paddingLeft: "15px",
                position: "absolute",
                color: "black"
              }}
            >
                {!sortState ? "expand_more" : "expand_less"}
              </span>
            </th></>
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
                  {parseValue(value as string, key)}
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
        <p>Count: {Array.from(new Set(data)).length}</p>
        {table}
        <div>{isFetching ? "Updating..." : ""}</div>
        <ReactQueryDevtools initialIsOpen={true} />
      </div>
    </>
  );
}

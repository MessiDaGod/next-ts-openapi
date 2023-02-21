import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import axios from "axios";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import styles from "../styles/Home.module.scss";
import { dataGridResize } from "./api/dataGridResize";
import { parseValue } from "./utils";

const queryClient = new QueryClient();


interface DataSet {
  [key: number]: number | undefined;
  row: number | undefined;
  columnName: string | undefined;
  columnIndex: number | undefined;
  value: string | undefined;
}

// async function getGoodColumns(): Promise<string[]> {
//   const response = await fetch("/GoodColumns.json");
//   const data = await response.json();
//   return data.map((item: any) => item.Name);
// }

function GenerateDynamicData(
  data: [] | undefined
) : DataSet[] {
  if (!data) return;
  if (data.length === 0) return;
  const myDataSet: DataSet[] = [];

  // const goodColumns = await getGoodColumns();
  for (let i = 0; i < data.length; i++) {
    const values = Object.entries(data[i]);
    values.map((value, idx: number) => {
      myDataSet.push({ row: i, columnName: value[0], columnIndex: idx, value: value[1] as string });
    });
  }

  // const newColumns = goodColumns.filter((col) => {
  //   return Object.keys(myDataSet).includes(col);
  // });

  console.log(myDataSet);
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
  const [data, setData] = React.useState<[]>([]);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 25;
  const { isLoading, error, isFetching } = useQuery("repoData", () =>
    axios
      .get("https://localhost:5006/api/data/GetDimensions")
      .then((res) => setData(res.data))
  );

  function handleSetData() {
    console.info("resizing...");
    dataGridResize();
  }

  useEffect(() => {
    async function fetchData() {
      // console.info(data);
      setData(data);
    }
    fetchData();
    const handleListeners = () => { handleSetData(); }
    document.addEventListener('DOMContentLoaded', handleListeners);
    return () => {
      document.removeEventListener('DOMContentLoaded', handleListeners);
    };
  }, [data]);

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

  // const memoizedData = React.useMemo(() => GenerateDynamicData(), [GenerateDynamicData]);

  // function GenerateDynamicData<T>(): DataTable<T> | undefined {

  //   if (!data) return;
  //   const json = JSON.stringify(data);
  //   const dataSet: T[] = JSON.parse(json).map((vendor: T) => ({
  //     ...vendor,
  //   }));
  //   if (dataSet.length > 0) {
  //     const newItems = GetDataDictionary(dataSet);
  //     console.log("generating dynamic data...");
  //     return newItems;
  //   }
  // }


  function GenerateTableHtml() {
    if (Array.isArray(data)) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      // Pagination logic

      const tableRows = [
        gridItems.map((item, idx) => {
          const columnNames = item.columnName.replaceAll("_", " ").split(" ");
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
              data-column-id={item.columnName}
            >
              <span
                className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
                onClick={() => handleSort(item.columnName)}
                style={{
                  margin: "auto",
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                {!sortState ? "expand_more" : "expand_less"}
              </span>
              {columnNamesWithLineBreaks}
              <div className={styles["columndivider"]}></div>
            </th>
          );
        }),
        ...gridItems
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((_row, rowIndex: number) => (
            <tr key={_row.row} className={styles["gridjs-tr"]}>
                <td
                  key={`${_row.columnName}_${_row.row}`}
                  className={styles["dataGridtd"]}
                  data-column-id={_row.columnName}
                >
                  {parseValue(_row.value, _row.columnName)}
                </td>
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
        <ReactQueryDevtools initialIsOpen />
      </div>
    </>
  );
}

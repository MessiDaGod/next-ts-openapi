import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import axios from "axios";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import styles from "../styles/yardiInterface.module.scss";
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
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);
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
      setMouseDown(false);
    }
    fetchData();
    dataGridResize();
  }, [data]);


  useEffect(() => {
    async function fetchData() {
      setMouseDown(false);
    }
    fetchData();
    // dataGridResize();
  }, []);

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

  function handleMouseDown(e) {
    e.preventDefault();
    var pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined;
    setMouseDown(true);
      const regex = /coldivider/;
      const target = e.target as HTMLElement;
      // if (!target.classList) return;
      // const isMatched = target.classList[0].match(regex);
      // if (!isMatched) return;

      curCol = target ? target.parentElement : null;
      nxtCol = curCol ? (curCol.nextElementSibling as HTMLElement) : null;
      // nxtCol = nxtCol ? (nxtCol?.nextElementSibling as HTMLElement) : null;
      pageX = e.pageX;

      const padding = curCol ? paddingDiff(curCol) : 0;
      curColWidth =
        curCol && curCol.offsetWidth > 0 && curCol.offsetWidth > padding
          ? curCol.offsetWidth - padding
          : 0;
      if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;

      const diffX = e.pageX - (pageX ?? 0);
      if (curCol) {
        console.log(curCol.style.width);
        curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
        curCol.style.width = (curColWidth ?? 0) + diffX + "px";
      }

      if (nxtCol) {
        nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
        nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";
      }

      curCol = null;
      nxtCol = null;
      pageX = undefined;
      nxtColWidth = undefined;
      curColWidth = undefined;
  }



  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      const columns = gridItems[0].columnCount;
      const tableRows = [
        gridItems.map((item, idx) => {
          if (idx > columns - 1) return;
          const columnNames = item.columnName.replaceAll("_", " ").split("_");
          const columnNamesWithLineBreaks = columnNames.map((name) => (
            <div
              key={`${name}${idx}`}
              className={styles["th"]}
              style={{ width: "100px" }}
              data-column-id={item.columnName}
            >
              {name}{" "}
              <span
                className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
                onClick={() => handleSort(item.columnName)}
                style={{
                  color: "white",
                  background: "transparent",
                }}
              >
                {!sortState ? "expand_more" : "expand_less"}
              </span>
              <div key={`${name}${idx}`}
                className={styles["coldivider"]}
                // onMouseDown={handleMouseDown}
              ></div>
            </div>
          ));

          return <>{columnNamesWithLineBreaks}</>;
        }),
        ...data
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((_row, rowIndex: number) => (
            <div key={`${rowIndex}`} className={styles["tr"]}>
              {Object.entries(_row).map(([key, value], index: number) => (
                <div
                  key={`${key}_${rowIndex}_${index}`}
                  className={styles["td"]}
                  data-column-id={key}
                  style={{ width: "100px" }}
                >
                  {parseValue(value as string, key)}
                </div>
              ))}
            </div>
          )),
      ];

      if (tableRows.length > 0) {
        return (
          <div style={{ overflow: "auto" }}>
            <div id="gridjs_0" className={styles["divTable"]}>
              <div className={styles["thead"]}>
                <div className={styles["tr"]}>{tableRows[0]}</div>
              </div>
              <div className={styles["tbody"]}>{tableRows.slice(1)}</div>
            </div>
          </div>
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

function paddingDiff(col: HTMLElement): number {
  if (getStyleVal(col, "box-sizing") === "border-box") {
    return 0;
  }
  const padLeft = getStyleVal(col, "padding-left");
  const padRight = getStyleVal(col, "padding-right");
  return parseInt(padLeft) + parseInt(padRight);
}

function getStyleVal(elm: HTMLElement, css: string): string {
  return window.getComputedStyle(elm, null).getPropertyValue(css);
}

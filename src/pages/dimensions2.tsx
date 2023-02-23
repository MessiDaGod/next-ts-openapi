import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import axios from "axios";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import styles from "../styles/yardiInterface.module.scss";
import { dataGridResize } from "./api/resizeGrid";
import { isColumnHidden, isRowEmpty, parseValue } from "./utils";
import { response } from "express";
import { Pagination } from "@/pagination";
import PropertyDropdown from "./propertyDropdown";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { PropOptions } from "./api/Objects/PropOptions";

interface DataSet {
  [key: number]: number | undefined;
  row: number | undefined;
  columnName: string | undefined;
  columnIndex: number | undefined;
  value: string | undefined;
  columnCount: number | undefined;
  rowCount: number | undefined;
}

async function getGoodColumns(): Promise<string[]> {
  const response = await fetch("/GoodColumns.json");
  const data = await response.json();
  return data.map((item: any) => item.Name);
}

async function GenerateDynamicData<T>(
  data: T[] | undefined
): Promise<DataSet[]> {
  if (!data) return [];
  if (data.length === 0) return [];

  const goodColumns = await getGoodColumns();
  const myDataSet: DataSet[] = [];

  for (let i = 0; i < data.length; i++) {
    const values = Object.entries(data[i]);
    values.map((value, idx: number) => {
      if (goodColumns.includes(value[0])) {
        myDataSet.push({
          row: i,
          columnName: value[0],
          columnIndex: idx,
          value: value[1] as string,
          columnCount: goodColumns.length,
          rowCount: data.length,
        });
      }
    });
  }

  return myDataSet;
}

export default function App() {
  Dimensions2<PropOptions>();
}

async function Dimensions2<T>() {
  const [data, setData] = React.useState<T[]>([]);
  const [size, setSize] = React.useState<Boolean>(null);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);
  const itemsPerPage = 25;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  useEffect(() => {
    async function fetchData() {
      setData(await getPropOptionsAsync(50));
      setSize(false);
      setMouseDown(false);
    }
    fetchData();
    dataGridResize();
  }, []);

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

  async function GenerateTableHtml() {
    // if (Array.isArray(data) && data.length > 0) {
    const gridItems = await GenerateDynamicData(data);

    if (!gridItems) return;
    const tableRows = [
      data
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((_row, rowIndex: number) => (
          <div key={`${rowIndex}`} className={styles["tr"]}>
            {Object.entries(_row).map(([key, value], index: number) => (
              <div
                key={`${key}_${rowIndex}_${index}`}
                className={styles["td"]}
                data-column-id={key}
                style={{ width: "100px" }}
                hidden={isColumnHidden(data, key)}
              >
                {parseValue(value as string, key)}
              </div>
            ))}
          </div>
        )),
    ];

    if (tableRows.length > 0) {
      const totalPages = Math.ceil(data.length / itemsPerPage);
      return (
        <>
          <div style={{ overflow: "auto" }}>
            <div id="gridjs_0" className={styles["divTable"]}>
              <div className={styles["thead"]}>
                <div className={styles["tr"]}>{tableRows[0]}</div>
              </div>
              <div className={styles["tbody"]}>{tableRows.slice(1)}</div>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      );
    }
  }
  //   }

  const table = await GenerateTableHtml();

  return <React.Fragment>{table ? table : undefined}</React.Fragment>;
}

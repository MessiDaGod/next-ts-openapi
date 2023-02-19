import React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import { Pagination } from "./pagination";

interface Props<T> {
  data: T | T[];
  generateData: (data: T | T[]) => any;
}

function DynamicGrid<T>({ data, generateData }: Props<T>) {
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const itemsPerPage = 25;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = Array.isArray(data) ? data.slice(startIndex, endIndex) : [];

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    handleSetData();
  });

  function handleSetData() {
    dataGridResize();
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

  const table = generateData(currentData);

  if (table && Array.isArray(data) && data.length > 0) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
      <>
        <div className={styles["datagriddiv"]}>
          <i id="ruler" hidden></i>
          <div className="h-4" />
          <i id="ruler" hidden></i>
          {table}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </>
    );
  }

  function isRowEmpty(row: T): boolean {
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

  function isColumnHidden<T>(columnName: string): boolean {
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

export default DynamicGrid;

import React from "react";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable, DataSet } from "./api/DataObject";
import { Pagination } from "./pagination";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { getAccounts } from "./api/getAccounts";
import styles from "../styles/yardiInterface.module.scss";
import { isColumnHidden, parseValue } from "./utils";
import { dataGridResize, getColumnWidths } from "../hooks/dataGridResize";
import { MouseEventHandler } from "react";
import PropertyDropdown from "./PropertyDropdown";

async function GetDimensions(take: number | null = null) {
  try {
    let url = `https://localhost:5006/api/data/GetDimensions${
      take ? `?take=${take}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    });
    return JSON.parse(await response.text());
  } catch (error) {
    return error;
  }
}

function DynamicGrid<T>(selectItem?: string, myData?: T[]) {
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
            response = await getPropOptionsAsync(100);
            setData(response);
            break;
          case "GetAccounts":
            response = await getAccounts(100);
            setData(response);
            break;
          case "GetDimensions":
            response = await GetDimensions(10);
            setData(response);
            break;
          case undefined:
            break;
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [selectItem, myData]);

  React.useEffect(() => {
    console.info("resizing due to useEffect in dynamicGrid.tsx");
    dataGridResize();
    getColumnWidths("gridjs_");
  }, [data]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedData = React.useMemo(() => GenerateDynamicData(data), [data]);

  function GenerateDynamicData<T>(data: T[] | undefined): DataSet[] {
    if (!data) return;
    if (data.length === 0) return;
    const myDataSet: DataSet[] = [];

    // const goodColumns = getGoodColumns();

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

  function handleResize(e) {
    e.preventDefault();
    getColumnWidths("gridjs_");
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
    if (Array.isArray(data) && data.length > 0) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      const columns = gridItems[0].columnCount;
      const tableRows = [
        gridItems.map((item, idx) => {
          if (idx > columns - 1) return;
          const columnNames = item.columnName.replaceAll("_", " ").split("_");
          const columnNamesWithLineBreaks = columnNames.map(
            (name, index: number) => (
              <div
                id={`${name}${idx}${index}`}
                key={`${name}${idx}${index}`}
                className={styles["th"]}
                style={{ width: "100px" }}
                data-column-id={item.columnName}
                hidden={isColumnHidden(data, item.columnName)}
              >
                {name}{" "}
                <span
                  className={"material-symbols-outlined"}
                  onClick={() => handleSort(item.columnName)}
                  style={{
                    color: "black",
                    background: "transparent",
                  }}
                >
                  {!sortState ? "expand_more" : "expand_less"}
                </span>
                <div
                  key={`${name}${idx}`}
                  className={styles["coldivider"]}
                ></div>
              </div>
            )
          );

          return <div key={`${idx}`}>{columnNamesWithLineBreaks}</div>;
        }),
        ...data
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((_row, rowIndex: number) => (
            <div key={`${rowIndex}`} className={styles["tr"]}>
              <div key={`${rowIndex}`} className={styles["rowdivider"]}></div>
              {Object.entries(_row).map(([key, value], index: number) => (
                <div
                  key={`${key}_${index}`}
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
  }

  const table = GenerateTableHtml();

  if (table && Array.isArray(data) && data.length > 0) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
      <React.Fragment>
        <span
          className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
          onClick={handleResize}
          style={{
            color: "red",
            background: "transparent",
            position: "relative",
          }}
        >
          {"aspect_ratio"}
        </span>
        <div className={styles["datagriddiv"]}>{table}</div>
      </React.Fragment>
    );
  }
}

export default DynamicGrid;

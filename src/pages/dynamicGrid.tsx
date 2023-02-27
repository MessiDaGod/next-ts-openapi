import React, { Key, useRef } from "react";
import { getVendors } from "./api/getVendors";
import { DataSet } from "./api/DataObject";
import { Pagination } from "./pagination";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { getAccounts } from "./api/getAccounts";
import styles from "../styles/yardiInterface.module.scss";
import { isColumnHidden, parseValue } from "./utils";
import {
  dataGridResize,
  setColumnWidths,
  paddingDiffY,
} from "../hooks/dataGridResize";
import cn from "classnames";
import Console from "./Console";

async function GetDimensions(take: number | null = null) {
  try {
    let url = `https://localhost:5006/api/data/GetDimensions${
      take ? `?take=${encodeURIComponent(take)}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    });
    return JSON.parse(await response.text());
  } catch (error) {
    return error;
  }
}

async function getFromQuery(table: string) {
  try {
    let url = `https://localhost:5006/api/data/RunSqlQuery${
      table
        ? `?table=${encodeURIComponent(table)}`
        : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    });
    return JSON.parse(await response.text());
  } catch (error) {
    return error;
  }
}

interface DynamicGridProps {
  [key: string]: string;
  selectItem?: string;
}

function DynamicGrid<T>({ selectItem }: DynamicGridProps) {
  const [data, setData] = React.useState<T[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState(selectItem);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isExpanded, setIsExpanded] = React.useState(false);
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
            response = await GetDimensions(5);
            setData(response);
            break;
          case "GetFromQuery":
            response = await getFromQuery("total");
            setData(response);
            break;
          case undefined:
            break;
        }
      console.log(response);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [selected]);

  React.useEffect(() => {
    console.info("resizing due to useEffect in dynamicGrid.tsx");
    dataGridResize(itemsPerPage);
  }, [selected, data]);

  React.useEffect(() => { setColumnWidths("gridjs_"); }, []);
  const memoizedData = React.useMemo(() => GenerateDynamicData(data), []);

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
    setColumnWidths("gridjs_");
    setRowHeights();
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

  let pageY: number | undefined,
    curRow: HTMLElement | null,
    nxtRow: HTMLElement | null,
    curRowHeight: number | undefined,
    nxtRowHeight: number | undefined;

  function removeMouseDownListener(e) {
    e.preventDefault();
    document.addEventListener("mouseup", function (e: MouseEvent): void {
      curRow = null;
      nxtRow = null;
      pageY = undefined;
      curRowHeight = undefined;
      nxtRowHeight = undefined;
      console.info("removed mousedown listener");
    });
  }

  function setRowHeights(tableId?: string) {
    const divTable = document.querySelectorAll(
      '[class*="' + cn(styles["divTable"]) + '"]'
    )[0] as HTMLElement;
    let allrows = Array.from(
      new Set([
        ...divTable.querySelectorAll(
          '[data-row-id*=""]'
        ),
      ])
    );
    allrows.forEach((row) => {
      (row as HTMLElement).style.minHeight = "0px";
      (row as HTMLElement).style.padding = "0px";
    });
  }

  function handleRowClick(e) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const divTable = document.querySelectorAll(
      '[class*="' + cn(styles["divTable"]) + '"]'
    )[0] as HTMLElement;

    const tables = [...document.querySelectorAll('[id*="' + "gridjs_" + '"]')];
    const table = tables[0] as HTMLElement;
    nxtRow = target.parentElement as HTMLElement;
    const tmp = nxtRow
      ? document.querySelectorAll(
          '[data-row-id="' + (parseInt(nxtRow.dataset.rowId) - 1) + '"]'
        )
      : null;
    curRow = tmp ? (tmp[0] as HTMLElement) : null;

    pageY = e.pageY;
    const padding = curRow ? paddingDiffY(curRow) : 0;

    curRowHeight =
      curRow && curRow.offsetHeight > 0 && curRow.offsetHeight > padding
        ? curRow.offsetHeight - padding
        : 0;
    nxtRowHeight = divTable ? divTable.offsetHeight - padding : 0;
    document.addEventListener("mousemove", function (e3) {
      e3.preventDefault();
      const diffY = e3.pageY - (pageY ?? 0);

      if (curRow) {
        let allCells = Array.from(
          new Set([
            ...divTable.querySelectorAll(
              '[data-row-id="' + curRow.dataset.rowId + '"]'
            ),
          ])
        );
        if (allCells) {
          curRow.style.minHeight = (curRowHeight ?? 0) + diffY + "px";
          curRow.style.height = (curRowHeight ?? 0) + diffY + "px";
          curRow.style.width = "100%";
          allCells.forEach((cell) => {
            (cell as HTMLElement).style.minHeight =
              (curRowHeight ?? 0) + diffY + "px";
            (cell as HTMLElement).style.height =
              (curRowHeight ?? 0) + diffY + "px";
          });
        }
      }

      if (curRow === undefined && nxtRow.dataset.rowId === "-1") {
        let allCells = Array.from(
          new Set([
            ...divTable.querySelectorAll('[data-row-id="' + "-1" + '"]'),
          ])
        );

        allCells.forEach((cell) => {
          (cell as HTMLElement).style.width = "100%";
          (cell as HTMLElement).style.minHeight =
            (curRowHeight ?? 0) + diffY + "px";
          (cell as HTMLElement).style.height =
            (curRowHeight ?? 0) + diffY + "px";
        });
      }
    });
  }


  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      const header = Object.values(data).map((key, idx: number) => {
        const firstHeader = Object.keys(key).map(
          (cols, index: number) =>
            !isColumnHidden(data, cols) &&
            idx == 0 &&
            index === 0 && (
              <div
                key={cols}
                className={styles["th"]}
                style={{ width: "100px" }}
                data-column-id={cols}
                hidden={isColumnHidden(data, cols)}
              >
                <span
                  key={"key"}
                  className={`${styles["black"]} material-symbols-outlined`}
                  onClick={handleResize}
                  style={{
                    background: "transparent",
                    position: "relative",
                    zIndex: 10,
                    color: "black",
                    cursor: "cell",
                  }}
                >
                  {"aspect_ratio"}
                </span>
                {cols}
                <span
                  className={`${"material-symbols-outlined"} ${
                    styles["black"]
                  }`}
                  onClick={() => handleSort(cols)}
                >
                  {!sortState ? "expand_more" : "expand_less"}
                </span>
                <div className={styles["coldivider"]}></div>
              </div>
            )
        );

        const remainingHeaders = Object.keys(key).map(
          (cols, index: number) =>
            !isColumnHidden(data, cols) &&
            idx == 0 &&
            index > 0 && (
              <div
                key={cols}
                className={styles["th"]}
                style={{ width: "100px" }}
                data-column-id={cols}
                hidden={isColumnHidden(data, cols)}
              >
                {cols}{" "}
                <span
                  className={`${"material-symbols-outlined"} ${
                    styles["black"]
                  }`}
                  onClick={() => handleSort(cols)}
                >
                  {!sortState ? "expand_more" : "expand_less"}
                </span>
                <div className={styles["coldivider"]}></div>
              </div>
            )
        );

        return [...firstHeader, ...remainingHeaders];
      });

      const rows = [...data]
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((row, rowIndex: number) => (
          <div
            key={`${rowIndex}`}
            className={styles["tr"]}
            data-row-id={rowIndex}
          >
            <div
              key={`${rowIndex}`}
              className={styles["rowdivider"]}
              onMouseDown={handleRowClick}
              onMouseUp={removeMouseDownListener}
            ></div>
            {Object.entries(row).map(
              ([key, value], index: number) =>
                !isColumnHidden(data, key) && (
                  <div
                    key={`${key}_${index}`}
                    className={styles["td"]}
                    data-column-id={key}
                    style={{ width: "100px" }}
                  >
                    {parseValue(value as string, key)}
                  </div>
                )
            )}
          </div>
        ));

      try {
        if (rows.length > 0) {
          const totalPages = Math.ceil(data.length / itemsPerPage);
          return (
            <>
              <div className={cn(styles["table-container"])}>
                <div
                  id={"gridjs_0"}
                  ref={tableRef}
                  key={"gridjs_0"}
                  className={styles["divTable"]}
                >
                  <div className={styles["tr"]} data-row-id="0">
                    {header[0]}
                  </div>

                  <div key={"tbody"} className={styles["tbody"]}>
                    {rows.slice(1)}
                  </div>
                  <div className={styles["tr"]} data-row-id="-1">
                    <div
                      className={styles["rowdivider"]}
                      onMouseDown={handleRowClick}
                      onMouseUp={removeMouseDownListener}
                      style={{ width: "100%", borderTop: "2px solid green" }}
                    ></div>
                  </div>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          );
        }
      } catch (err) {
        return <Console code={err.message} />;
      }
    }
  }

  const table = GenerateTableHtml();

  if (table && Array.isArray(data) && data.length > 0) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return <>{table}</>;
  }
}

export default DynamicGrid;

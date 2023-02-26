import React, { Key } from "react";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable, DataSet } from "./api/DataObject";
import { Pagination } from "./pagination";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { getAccounts } from "./api/getAccounts";
import styles from "../styles/yardiInterface.module.scss";
import { isColumnHidden, parseValue } from "./utils";
import {
  dataGridResize,
  getColumnWidths,
  paddingDiffY,
} from "../hooks/dataGridResize";
import { Button } from "../components/Button";
import cn from "classnames";
import { IconChevron } from "components/Icon/IconChevron";

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

interface DynamicGridProps {
  [key: string]: string;
  selectItem?: string;
}

function DynamicGrid<T>({ selectItem }: DynamicGridProps) {
  const [data, setData] = React.useState<T[]>([]);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const itemsPerPage = 25;

  // const id = children[0].props.id;

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
          case undefined:
            break;
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [selectItem]);

  React.useEffect(() => {
    console.info("resizing due to useEffect in dynamicGrid.tsx");
    dataGridResize(itemsPerPage);
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
  function handleRowClick(e) {
    e.preventDefault();
    const target = e.target as HTMLElement;

    const divTable = document.querySelectorAll(
      '[class*="' + cn(styles["divTable"]) + '"]'
    )[0];

    const tables = [...document.querySelectorAll('[id^="' + "gridjs_" + '"]')];
    const table = tables[0] as HTMLElement;
    curRow = target.parentElement as HTMLElement;

    nxtRow = curRow ? (divTable as HTMLElement) : null;
    pageY = e.pageY;

    const padding = curRow ? paddingDiffY(curRow) : 0;

    curRowHeight =
      curRow && curRow.offsetHeight > 0 && curRow.offsetHeight > padding
        ? curRow.offsetHeight - padding
        : 0;
    nxtRowHeight = nxtRow ? nxtRow.offsetHeight - padding : 0;

    document.addEventListener("mousemove", function (e3) {
      e3.preventDefault();
      const diffY = e3.pageY - (pageY ?? 0);

      if (curRow) {
        curRow.style.borderBottom = "1px solid red";
        if (curRow) {
          let allCells = Array.from(
            new Set([
              ...table.querySelectorAll(
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
        if (nxtRow) {
          nxtRow.style.minHeight = (nxtRowHeight ?? 0) - diffY + "px";
          nxtRow.style.height = (nxtRowHeight ?? 0) - diffY + "px";

          if (table) {
            let allCells = Array.from(
              new Set([
                ...table.querySelectorAll(
                  '[data-row-id="' + nxtRow.dataset.rowId + '"]'
                ),
              ])
            );
            if (allCells)
              allCells.forEach((cell) => {
                (cell as HTMLElement).style.minHeight =
                  (nxtRowHeight ?? 0) + diffY + "px";
                (cell as HTMLElement).style.height =
                  (nxtRowHeight ?? 0) + diffY + "px";
              });
          }
        }
      }
    });
  }

  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;
      const header = Object.values(data).map((key, idx: number) => {
        const headerData = Object.keys(key).map(
          (cols) =>
            !isColumnHidden(data, cols) &&
            idx == 0 && (
              <div
                key={cols}
                className={styles["th"]}
                style={{ width: "100px" }}
                data-column-id={cols}
              >
                {cols}{" "}
                <span
                  className={"material-symbols-outlined"}
                  onClick={() => handleSort(cols)}
                  style={{
                    color: "black",
                    background: "transparent",
                  }}
                >
                  {!sortState ? "expand_more" : "expand_less"}
                </span>
                <div className={styles["coldivider"]}></div>
              </div>
            )
        );

        return headerData;
      });

      const rows = [...data]
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((row, rowIndex: number) => (
          <div key={`${rowIndex}`} className={styles["tr"]}>
            <div key={`${rowIndex}`} className={styles["rowdivider"]}></div>
            {Object.entries(row).map(([key, value], index: number) => !isColumnHidden(data, key) && (
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
        ));

      console.log(rows);
      if (rows.length > 0) {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        return (
          <>
            <div
              id="gridjs_0"
              key={"gridjs_0"}
              className={styles["divTable"]}
              style={{ overflow: "auto" }}
            >
              <div className={styles["thead"]}>
                <div className={styles["tr"]}>{header[0]}</div>
              </div>
              <div key={"tbody"} className={styles["tbody"]}>
                {rows.slice(1)}
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
      <>
        <span
          key={"key"}
          className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
          onClick={handleResize}
          style={{
            background: "transparent",
            position: "absolute",
            zIndex: 1000,
            color: "black",
            cursor: "cell",
          }}
        >
          {"aspect_ratio"}
        </span>
        {table}
      </>
    );
  }
}

export default DynamicGrid;

import React, { useRef } from "react";
// import { getVendors } from "./api/getVendors";
import { Pagination } from "./pagination";
import GoodColumns from "../../public/GoodColumns.json";
import styles from "./GridDropdown.module.scss";
import { ColumnWidths, CustomError, isColumnHidden, parseValue } from "./utils";
import cn from "classNames";

// import vendors from "../../public/vendors.json";
// import properties from "../../public/propOptions.json";
// import accounts from "../../public/accounts.json";
import dimensions from "../../public/Dimensions.json";
import GenericDropdown from "./GenericDropdown";
import { removeAllListeners, removeListener } from "process";

async function GetDimensions(take: number | null = null) {
  try {
    let url = `https://localhost:5006/api/data/GetDimensions${
      take ? `?take=${encodeURIComponent(take)}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    });
    const result = await response.text();
    return JSON.parse(result);
  } catch (error) {
    return error;
  }
}

async function getFromQuery(table: string, take: number) {
  const url = "https://localhost:5006/api/data/RunSqlQuery";
  const params = { table, take };
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
  const fullUrl = `${url}?${queryString}`;
  try {
    const response = await fetch(fullUrl, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

interface DynamicGridProps {
  selectItem?: string;
  style?: React.CSSProperties;
  showPagination?: boolean;
  numItems?: number;
}

function DynamicGrid<T>({
  selectItem,
  style,
  showPagination,
  numItems,
}: DynamicGridProps) {
  const [data, setData] = React.useState<T[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState(selectItem);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [goodColumns, setGoodColumns] = React.useState<string[]>([""]);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const itemsPerPage = 10;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function handleDropdownOpen(key) {
    setActiveDropdown(key);
  }

  function handleDropdownClose() {
    setActiveDropdown(null);
  }

  React.useEffect(() => {
    if (selected) {
      setGoodColumns(JSON.parse(JSON.stringify(GoodColumns)));
    }
  }, [data]);

  //   React.useEffect(() => {
  //     dataGridResize(itemsPerPage);
  //     setColumnWidths();
  // }, [tableRef]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        let response = [];

        switch (selectItem) {
          case "GetDimensions":
            response = JSON.parse(JSON.stringify(dimensions));
            setData(response);
            break;
          case "GetFromQuery":
            response = await getFromQuery("total", numItems ?? 1);
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
  }, [numItems, selectItem]);

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
  function handleResize(e) {
    e.preventDefault();
    setColumnWidths();
    setRowHeights();
  }

  function paddingDiffY(col: HTMLElement): number {
    if (getStyleVal(col, "box-sizing") === "border-box") {
      return 0;
    }
    const padTop = getStyleVal(col, "padding-top");
    const padBottom = getStyleVal(col, "padding-bottom");
    return parseInt(padTop) + parseInt(padBottom);
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

  function setColumnWidths() {
    const table = tableRef.current as HTMLElement;
    if (!table) return;

    const columnWidths: ColumnWidths = {};

    const allRows = [...table.querySelectorAll('[class*="' + "tr" + '"]')];

    function visualLength(s: string) {
      const ruler = document.createElement("div");
      (ruler as HTMLElement).style.boxSizing = `content-box`;
      ruler.style.display = "block";
      ruler.style.visibility = "hidden";
      ruler.style.position = "absolute";
      ruler.style.whiteSpace = "nowrap";
      // ruler.style.padding = "0";
      (ruler as HTMLElement).style.zIndex = "0";
      ruler.innerText = s;
      document.body.appendChild(ruler);
      const padding = paddingDiff(ruler as HTMLElement);
      const width = ruler.getBoundingClientRect().width + padding;
      document.body.removeChild(ruler);
      return width;
    }

    allRows.forEach((row, rowNumber: number) => {
      const ths = row.querySelectorAll('[class*="' + "_th" + '"]');
      const tds = row.querySelectorAll('[class*="' + "_td" + '"]');
      const cells = [...ths, ...tds];

      cells.forEach((cell) => {
        const columnId = cell.getAttribute("data-column-id");
        if (columnId && cell.getAttribute("hidden") === null) {
          var cellCopy = cell.cloneNode(true) as HTMLElement;
          var spanWidths = 0;
          const icons = cell.querySelectorAll("span");
          if (icons && icons.length > 0) {
            for (let i = 0; i < icons.length; i++) {
              const icon = icons[i] as HTMLElement;
              spanWidths += icon.offsetWidth;
            }
          }
          let iconsToRemove = cellCopy.querySelectorAll("span");
          for (let i = 0; i < iconsToRemove.length; i++) {
            iconsToRemove[i].remove();
          }
          let cellWidth = visualLength(cellCopy.textContent || "");
          cellWidth += spanWidths;
          spanWidths = 0;
          const existingWidth = columnWidths[columnId];
          if (cellWidth > (existingWidth || 0)) {
            columnWidths[columnId] = cellWidth;
          }
          // console.log(`padding for columnId:  ${columnId}, row #${rowNumber} ${paddingDiff(cell as HTMLElement)}`);
        }
      });
    });

    Object.entries(columnWidths).map((width) => {
      const [key, value] = width;
      const cols = table.querySelectorAll(`[data-column-id="${key}"]`);
      cols.forEach((col) => {
        if (col) {
          (col as HTMLElement).style.width = `auto`;
          (col as HTMLElement).style.display = "inline-block";
          (col as HTMLElement).style.whiteSpace = "nowrap";
          (col as HTMLElement).style.textAlign = "left";
          (col as HTMLElement).style.padding = "0px";
          (col as HTMLElement).style.minHeight = "0px";
          (col as HTMLElement).style.zIndex = "0";
          (col as HTMLElement).style.minWidth = `${Math.round(value)}px`;
          (col as HTMLElement).style.width = `${Math.round(value)}px`;
        }
      });
    });

    let tableWidth = 0;
    const columns = table.querySelectorAll('[class*="' + "th" + '"]');
    columns.forEach((col) => {
      tableWidth +=
        parseInt((col as HTMLElement).style.width) +
        paddingDiff(col as HTMLElement);
    });

    // (table as HTMLElement).style.width = tableWidth.toString() + "px";
    // (table as HTMLElement).style.zIndex = "0";
    return columnWidths;
  }

  function setRowHeights(tableId?: string) {
    const divTable = document.querySelectorAll(
      '[class*="' + cn(styles["ddTable"]) + '"]'
    )[0] as HTMLElement;
    if (divTable) {
      let allrows = Array.from(
        new Set([...divTable.querySelectorAll('[data-row-id*=""]')])
      );
      allrows.forEach((row) => {
        (row as HTMLElement).style.minHeight = "0px";
        (row as HTMLElement).style.padding = "0px";
        (row as HTMLElement).style.zIndex = "0";
      });
    }
  }

  function handleRowClick(e) {
    let pageY: number | undefined,
      curRow: HTMLElement | null,
      nxtRow: HTMLElement | null,
      curRowHeight: number | undefined,
      nxtRowHeight: number | undefined;
    console.log("handleRowClick from dynamicGrid.tsx");
    e.preventDefault();
    const target = e.target as HTMLElement;
    const divTable = document.querySelectorAll(
      '[class*="' + cn(styles["ddTable"]) + '"]'
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
          (cell as HTMLElement).style.minHeight =
            (curRowHeight ?? 0) + diffY + "px";
          (cell as HTMLElement).style.height =
            (curRowHeight ?? 0) + diffY + "px";
        });
      }
    });
  }

  function setListeners(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    let pageX: number | undefined,
      curCol: HTMLElement | null,
      nxtCol: HTMLElement | null,
      curColWidth: number | undefined;

    const colDivider = e.target as HTMLElement;
    if (!colDivider.classList.contains(cn(styles["coldivider"]))) return;
    const headerDiv = colDivider.parentElement;
    const table = tableRef.current as HTMLElement;
    const activeDropdown = dropdownRef.current as HTMLElement;

    colDivider.onmousedown = function (e) {
      const target = headerDiv;
      curCol = target ? target : null;
      nxtCol = curCol ? (curCol.nextElementSibling as HTMLElement) : null;
      const padding = curCol ? paddingDiff(curCol) : 0;

      pageX = e.pageX;
      const currentColumnAllCells = [
        ...table.querySelectorAll(
          '[data-column-id*="' + headerDiv.dataset.columnId + '"]'
        ),
      ];
      curColWidth =
        curCol && curCol.offsetWidth > 0 && curCol.offsetWidth > padding
          ? curCol.offsetWidth - padding
          : 0;
      function onMouseMove(e) {
        const diffX = e.pageX - (pageX ?? 0);

        headerDiv.style.minWidth = (curColWidth ?? 0) + diffX + "px";
        headerDiv.style.width = (curColWidth ?? 0) + diffX + "px";
        headerDiv.style.zIndex = "10";

        if (currentColumnAllCells)
          currentColumnAllCells.forEach((cell) => {
            const td = cell as HTMLElement;
            td.style.minWidth = (curColWidth ?? 0) + diffX + "px";
            td.style.width = (curColWidth ?? 0) + diffX + "px";
            td.style.zIndex = "10";
          });

        // table.style.width = (parseInt(table.style.width) ?? 0) + diffX + "px";
        // table.style.width = (parseInt(table.style.width) ?? 0) + diffX + "px";
        // table.style.zIndex = "0";
      }

      // (2) move the colDivider on mousemove
      document.addEventListener("mousemove", onMouseMove);

      // (3) drop the colDivider, remove unneeded handlers
      colDivider.onmouseup = function () {
        console.info("removing colDivider.onmouseup");
        document.removeEventListener("mousemove", onMouseMove);
        console.info("removing onmouseenter Listner");
        removeAllListeners();
        colDivider.onmouseup = null;
      };
    };

    colDivider.ondragstart = function () {
      return false;
    };

    if (colDivider) {
      colDivider.addEventListener("dblclick", function (e: MouseEvent): void {
        setColumnWidths();
      });
    }
  }

  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
      const columns = Object.keys(data[0]);
      const header = columns.map((cols, idx: number) => {
        return (
          !isColumnHidden(data, cols) && (
            <div
              key={cols}
              className={styles["th"]}
              style={{ width: "100px" }}
              data-column-id={cols}
            >
              {cols}
              <span
                className={`${"material-symbols-outlined"} ${styles["black"]}`}
                onClick={() => handleSort(cols)}
              >
                {!sortState ? "expand_more" : "expand_less"}
              </span>
              <div
                className={styles["coldivider"]}
                onMouseEnter={setListeners}
              ></div>
            </div>
          )
        );
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
            ></div>
            {Object.entries(row).map(
              ([key, value], index: number) =>
                !isColumnHidden(data, key) && (
                  <div
                    key={`${key}_${index}`}
                    className={styles["td"]}
                    data-column-id={key}
                    style={{ width: "100px" }}
                    ref={dropdownRef}
                  >
                    {key.toUpperCase() === "PROPERTY" ? (
                      <GenericDropdown
                        selectItem="GetPropOptions"
                        style={{ position: "absolute", zIndex: 1 }}
                        showPagination={true}
                        showCheckbox={false}
                        tableRef={tableRef}
                        columns={columns["Property"]}
                      />
                    ) : key.toUpperCase() === "ACCOUNT" ? (
                      <GenericDropdown
                        selectItem="GetAccounts"
                        style={{ position: "absolute", zIndex: 1 }}
                        showPagination={true}
                        showCheckbox={false}
                        tableRef={tableRef}
                        columns={columns["Account"]}
                      />
                    ) : key.toUpperCase() === "PERSON" ? (
                      <GenericDropdown
                        selectItem="GetVendors"
                        style={{ position: "absolute", zIndex: 1 }}
                        showPagination={true}
                        showCheckbox={false}
                        tableRef={tableRef}
                        columns={columns["Vendor"]}
                      />
                    ) : (
                      parseValue(value as string, key)
                    )}
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
              <div
                style={style}
                className={!style ? cn(styles["table-container"]) : ""}
              >
                <div
                  id={"gridjs_"}
                  ref={tableRef}
                  className={styles["divTable"]}
                >
                  <div className={styles["tr"]} data-row-id="0">
                    {header}
                  </div>

                  <div key={"tbody"} className={styles["tbody"]}>
                    {rows.slice(1)}
                  </div>
                </div>
                <Pagination
                  id="pagination1"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          );
        }
      } catch (error) {
        if (error instanceof CustomError) {
          return <div className={"error"}>{error.message}</div>;
        } else {
          throw error;
        }
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

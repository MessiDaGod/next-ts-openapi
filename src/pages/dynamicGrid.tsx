import React, { useRef } from "react";
import { getVendors } from "./api/getVendors";
import { Pagination } from "./pagination";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { getAccounts } from "./api/getAccounts";
import styles from "./DataGridDropdown.module.scss";
import { ColumnWidths, isColumnHidden, parseValue } from "./utils";
import cn from "classnames";
import Console from "./Console";
import Dropdown from "./dropdown";
import DataGridDropdown from "./DataGridDropdown";

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

// async function getFromQuery(table: string, take: number) {
//   try {
//     let url = `https://localhost:5006/api/data/RunSqlQuery${
//       table ? `?table=${encodeURIComponent(table)}` : ""}`;

//     url += take ? `?take=${encodeURIComponent(take)}` : "";
//     const response = await fetch(url, {
//       method: "GET",
//     });
//     return JSON.parse(await response.text());
//   } catch (error) {
//     return error;
//   }
// }

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
}

function DynamicGrid<T>({ selectItem, style }: DynamicGridProps) {
  const [data, setData] = React.useState<T[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState(selectItem);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  // const [isExpanded, setIsExpanded] = React.useState(false);
  const itemsPerPage = 25;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  function handleSetSelected() {
    setSelected(selectItem);
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        let response = [];

        switch (selectItem) {
          case "GetVendors":
            response = await getVendors(2);
            setData(response);
            break;
          case "GetPropOptions":
            response = await getPropOptionsAsync(10);
            setData(response);
            break;
          case "GetAccounts":
            response = await getAccounts(10);
            setData(response);
            break;
          case "GetDimensions":
            response = await GetDimensions(1);
            setData(response);
            break;
          case "GetFromQuery":
            response = await getFromQuery("total", 5);
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
  }, []);

  React.useEffect(() => {
    if (selected) {
      console.log("React.useEffect initiated");
      dataGridResize(itemsPerPage);
      setColumnWidths();
    }
  }, [selected]);

  function setListeners(div: HTMLDivElement, itemsPerPage?: number): void {
    if (div.parentElement?.getAttribute("hidden") !== null) return;
    var pageX: number | undefined,
      curCol: HTMLElement | null,
      nxtCol: HTMLElement | null,
      prevCol: HTMLElement | null,
      curColWidth: number | undefined,
      nxtColWidth: number | undefined,
      prevColWidth: number | undefined;

    if (div.parentElement) {
      div.addEventListener("dblclick", function (e: MouseEvent): void {
        setColumnWidths();
      });

      div.addEventListener(
        "mousedown",
        function (e: MouseEvent): void {
          var target = e.target as HTMLElement;
          curCol = target ? target.parentElement : null;
          var nextCol = curCol
            ? (curCol.nextElementSibling as HTMLElement)
            : null;
          nextCol = nextCol
            ? (nextCol?.nextElementSibling as HTMLElement)
            : null;
          if (curCol)
            prevCol = curCol
              ? (curCol.previousElementSibling as HTMLElement)
              : null;
          pageX = e.pageX;

          const padding = curCol ? paddingDiff(curCol) : 0;

          curColWidth =
            curCol && curCol.offsetWidth > 0 && curCol.offsetWidth > padding
              ? curCol.offsetWidth - padding
              : 0;
          if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;

          if (prevCol) prevColWidth = prevCol.offsetWidth - padding;
        },
        { passive: true }
      );

      document.addEventListener(
        "mousemove",
        function (e: MouseEvent): void {
          const diffX = e.pageX - (pageX ?? 0);
          const tables = [
            ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
          ];
          if (curCol) {
            curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
            curCol.style.width = (curColWidth ?? 0) + diffX + "px";
            (curCol as HTMLElement).style.zIndex = "0";

            if (tables[0]) {
              let allCells = Array.from(
                new Set([
                  ...tables[0].querySelectorAll(
                    '[data-column-id="' + curCol.dataset.columnId + '"]'
                  ),
                ])
              );
              if (allCells)
                allCells.forEach((cell) => {
                  (cell as HTMLElement).style.minWidth =
                    (curColWidth ?? 0) + diffX + "px";
                  (cell as HTMLElement).style.width =
                    (curColWidth ?? 0) + diffX + "px";
                  (cell as HTMLElement).style.zIndex = "0";
                });
            }
          }

          if (nxtCol) {
            nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
            nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";
            (nxtCol as HTMLElement).style.zIndex = "0";

            if (tables[0]) {
              let allCells = Array.from(
                new Set([
                  ...tables[0].querySelectorAll(
                    '[data-column-id="' + nxtCol.dataset.columnId + '"]'
                  ),
                ])
              );
              if (allCells)
                allCells.forEach((cell) => {
                  (cell as HTMLElement).style.minWidth =
                    (nxtColWidth ?? 0) + diffX + "px";
                  (cell as HTMLElement).style.width =
                    (nxtColWidth ?? 0) + diffX + "px";
                  (cell as HTMLElement).style.zIndex = "0";
                });
            }
          }
        },
        { passive: true, once: false }
      );

      document.addEventListener("mouseup", function (e: MouseEvent): void {
        curCol = null;
        nxtCol = null;
        pageX = undefined;
        nxtColWidth = undefined;
        curColWidth = undefined;
      });
    }
  }

  function dataGridResize(itemsPerPage?: number) {
    initResizeListeners();
    let resizeDivs = Array.from(
      new Set([
        ...document.querySelectorAll('div[class*="' + "coldivider" + '"]'),
      ])
    );
    if (resizeDivs && resizeDivs.length > 0) {
      for (let i = 0; i < resizeDivs.length; i++) {
        setListeners(resizeDivs[i] as HTMLDivElement, itemsPerPage);
      }
    }

    function initResizeListeners() {
      if (!document) return;
      const tables = [
        ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
      ];
      for (let i = 0; i < tables.length; i++) {
        const columns = Array.from(
          new Set([...tables[i].querySelectorAll("th")])
        );
        columns.forEach((th) => {
          th.style.width = th.getBoundingClientRect().width + "px";
          th.style.minWidth = th.getBoundingClientRect().width + "px";
          (th as HTMLElement).style.zIndex = "0";
        });
        resizableGrid(tables[i] as HTMLTableElement);
      }

      function resizableGrid(table: HTMLTableElement) {
        const rows = Array.from(
          table.getElementsByTagName('div[class*="' + "tr" + '"]')
        );
        const cells = Array.from(
          table.getElementsByTagName('div[class*="' + "td" + '"]')
        );

        cells.forEach((cell) => {
          setCellListeners(cell as HTMLElement);
        });

        rows.forEach((tr) => {
          setRowListeners(tr as HTMLElement);
        });

        function setCellListeners(cell: HTMLElement) {
          if (cell.dataset.columnId === "Row")
            cell.addEventListener("mouseover", function (_e) {
              this.classList.add("cellhoverover");
            });

          cell.addEventListener("mouseout", function (_e) {
            this.classList.remove("cellhoverover");
          });
        }

        function setRowListeners(row: HTMLElement) {
          row.addEventListener("mouseover", function (_e) {
            this.classList.add("hoverover");
          });

          row.addEventListener("mouseout", function (_e) {
            this.classList.remove("hoverover");
          });
        }
      }
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
    const tables = [...document.querySelectorAll('[id*="' + "gridjs" + '"]')];
    tables.forEach((mytable) => {
      const table = mytable;
      if (!table) return;

      const columnWidths: ColumnWidths = {};

      const allRows = [
        ...tables[0].querySelectorAll('[class*="' + "tr" + '"]'),
      ];

      function visualLength(s: string) {
        const ruler = document.createElement("div");
        (ruler as HTMLElement).style.boxSizing = `content-box`;
        ruler.style.display = "block";
        ruler.style.visibility = "hidden";
        ruler.style.position = "absolute";
        ruler.style.whiteSpace = "nowrap";
        ruler.style.padding = "0.25rem";
        (ruler as HTMLElement).style.zIndex = "0";
        ruler.innerText = s;
        document.body.appendChild(ruler);
        const padding = paddingDiff(ruler as HTMLElement);
        const width = Math.round(ruler.getBoundingClientRect().width + padding);
        document.body.removeChild(ruler);
        return width;
      }

      allRows.forEach((row) => {
        const ths = row.querySelectorAll('[class*="' + "th" + '"]');
        const tds = row.querySelectorAll('[class*="' + "td" + '"]');
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
            (col as HTMLElement).style.minWidth = `${value}px`;
            (col as HTMLElement).style.width = `${value}px`;
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

      (table as HTMLElement).style.width = tableWidth.toString() + "px";
      (table as HTMLElement).style.zIndex = "0";
      return columnWidths;
    });
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
      '[class*="' + cn(styles["ddTable"]) + '"]'
    )[0] as HTMLElement;
    let allrows = Array.from(
      new Set([...divTable.querySelectorAll('[data-row-id*=""]')])
    );
    allrows.forEach((row) => {
      (row as HTMLElement).style.minHeight = "0px";
      (row as HTMLElement).style.padding = "0px";
      (row as HTMLElement).style.zIndex = "0";
    });
  }

  function handleRowClick(e) {
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

  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
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
                    position: "relative",
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
                    {key === "PROPERTY" ? (
                      <DataGridDropdown style={{ position: "absolute" }} />
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
              <div className={cn(styles["table-container"])}>
                <div
                  id={"gridjs_0"}
                  ref={tableRef}
                  key={"gridjs_0"}
                  className={styles["ddTable"]}
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
                    ></div>
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

import React, { useState, useRef, CSSProperties } from "react";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { emptyPropOptions, PropOptions } from "./api/Objects/PropOptions";
import styles from "./GridDropdown.module.scss";
import { ColumnWidths, CustomError, isColumnHidden, parseValue } from "./utils";
import { Pagination } from "pages/pagination";
import cn from "classnames";


export interface DataGridDropdownProps {
  style?: React.CSSProperties;
  showCheckbox?: boolean;
  showPagination?: boolean;
  ref: React.RefObject<HTMLDivElement>;
}

function getGoodColumns(): Promise<string[]> {
  return fetch("/GoodColumns.json")
    .then((response) => response.json())
    .then((data) => data.map((item: any) => item.Name));
}

const GridDropdown: React.FC<DataGridDropdownProps> = ({
  showCheckbox,
  style,
  showPagination,
  ref,
}) => {
  const [data, setData] = React.useState<PropOptions[]>([]);
  const [searchText, setSearchText] = useState("");
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [goodColumns, setGoodColumns] = useState<string[]>([""]);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isChecked, setIsChecked] = useState(true);
  const [hasPagination, setHasPagination] = useState(false);
  const itemsPerPage = 10;
  const cache = new Map<string, any>();

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPropOptionsAsync(20);
        const items = JSON.parse(JSON.stringify(response));
        setData(items);
        const goodCols = await getGoodColumns();
        setGoodColumns(goodCols);
        setHasPagination(showPagination);
      } catch (error) {
        return emptyPropOptions;
      }
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    console.log("React.useEffect GridDropdown.tsx");
    dataGridResize(itemsPerPage);
    // setColumnWidths();
    setDropdownWidth();
  }, [showSearchBox]);

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

  function setDropdownWidth() {
    const tables = document.querySelectorAll('[id*="' + "gridjs" + '"]');
    tables.forEach((mytable) => {
      const table = mytable as HTMLElement;
      const dropdownDivs = document.querySelectorAll(
        '[class*="' + "dropdown" + '"]'
      );
      dropdownDivs.forEach((dropdownDiv) => {
        const dropdown = dropdownDiv as HTMLElement;
        const parent = (table as HTMLElement).parentElement
          .parentElement as HTMLElement;
        dropdown.style.border = "";

        // let page = document.getElementById("pagination") as HTMLElement;
        // if (page) page.style.width = tableRef.current?.offsetWidth + "px";
      });
    });
  }

  function setColumnWidths() {
    const tables = [...document.querySelectorAll('[id*="' + "gridjs" + '"]')];
    tables.forEach((mytable) => {
      const table = mytable;
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
        // ruler.style.padding = "0.25rem";
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
      // (table as HTMLElement).style.border = "2px solid red";
      return columnWidths;
    });
  }

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
                });
            }
          }

          if (nxtCol) {
            nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
            nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";

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

  function handleShowSearchBox(e) {
    setShowSearchBox(true);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
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

  // const filteredData = Array.isArray(data)
  //   ? data.filter(
  //       (item) =>
  //         item.Property_Code.toString()
  //           .toLowerCase()
  //           .includes(searchText.toLowerCase()) ||
  //         item.Property_Name.toString()
  //           .toLowerCase()
  //           .includes(searchText.toLowerCase())
  //     )
  //   : data;

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
    const ddTable = document.querySelectorAll(
      '[class*="' + cn(styles["ddTable"]) + '"]'
    )[0] as HTMLElement;
    let allrows = Array.from(
      new Set([...ddTable.querySelectorAll('[data-row-id*=""]')])
    );
    allrows.forEach((row) => {
      (row as HTMLElement).style.minHeight = "0px";
      (row as HTMLElement).style.padding = "0px";
    });
  }

  function handleRowClick(e) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const ddTable = document.querySelectorAll(
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
    nxtRowHeight = ddTable ? ddTable.offsetHeight - padding : 0;
    document.addEventListener("mousemove", function (e3) {
      e3.preventDefault();
      const diffY = e3.pageY - (pageY ?? 0);

      if (curRow) {
        let allCells = Array.from(
          new Set([
            ...ddTable.querySelectorAll(
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
          new Set([...ddTable.querySelectorAll('[data-row-id="' + "-1" + '"]')])
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

  function handleResize(e) {
    e.preventDefault();
    setColumnWidths();
    setRowHeights();
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
              <div className={cn(styles["dd-container"])}>
                <div
                  id={"gridjs_0"}
                  ref={tableRef}
                  key={"gridjs_0"}
                  className={styles["ddTable"]}
                >
                  <div className={styles["thead"]}></div>
                  {
                    <>
                      <input
                        id="search-input"
                        type="search"
                        className={styles["rz-textbox findcomponent"]}
                        placeholder="Search ..."
                        autoComplete="on"
                        style={{
                          color: "white",
                          backgroundColor: "black",
                          fontSize: "14px",
                          borderBottom: "1px solid #2f333d",
                          borderTop: "1px solid #2f333d",
                          cursor: "text",
                          display: "block",
                          width: "100%",
                          padding: "10px",
                        }}
                      ></input>
                      <div style={{ width: "100%" }}>
                        <span
                          className={"material-symbols-outlined"}
                          style={{
                            color: "white",
                            background: "black",
                            display: "flex",
                            position: "relative",
                            transform: "translateY(-30px)",
                            float: "right",
                            marginRight: "20px",
                            cursor: "crosshair",
                          }}
                        >
                          {"search"}
                        </span>
                      </div>
                    </>
                  }
                  <div className={styles["tr"]} data-row-id="0">
                    {header[0]}
                  </div>
                  <div key={"tbody"} className={styles["tbody"]}>
                    {rows.slice(1)}
                  </div>
                  {/* {hasPagination && (
                    <div className={styles["tr"]} data-row-id="-1">
                      <div
                        className={styles["rowdivider"]}
                        onMouseDown={handleRowClick}
                        onMouseUp={removeMouseDownListener}
                      ></div>
                    </div>
                  )} */}
                  {hasPagination && (
                    <div className={styles["tr"]}>
                      <Pagination
                        id="pagination"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        style={{
                          width: "100%",
                          verticalAlign: "center",
                          textAlign: "center",
                          backgroundColor: "black",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        }
      } catch (error) {
        if (error instanceof CustomError) {
          return <>{error.message}</>
        } else {
          // handle other types of errors
          throw error;
        }
      }
    }
  }

  const table = GenerateTableHtml();
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };

  function Checkbox({}) {
    return (
      <label>
        <input
          id="checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheckboxChange(e)}
        />
        Dropdown with MouseEnter
      </label>
    );
  }

  return (
    <div style={style}>
      {showCheckbox && <Checkbox />}
      <div
        className={`${styles["dropdown"]}`}
        onMouseEnter={handleShowSearchBox}
        onMouseLeave={() => setShowSearchBox(false)}
      >
        <label
          className={`${styles["rz-placeholder"]}`}
          style={{
            width: "100%",
            cursor: "pointer",
            borderRadius: `${hasPagination ? '1px' : '0px'}`,
          }}
        >
          Property
          <span
            className={"material-symbols-outlined"}
            style={{
              color: "white",
              display: "inline-block",
              transform: "translateY(25%)",
            }}
          >
            {showSearchBox ? "expand_more" : "expand_less"}
          </span>
        </label>
        <div className={styles["dropdown-content"]}>
          {showSearchBox && isChecked && <>{table}</>}
          {!isChecked && <div>{table}</div>}
        </div>
      </div>
    </div>
  );
};

export default GridDropdown;

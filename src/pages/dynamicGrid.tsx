import React, { HTMLAttributes, useRef, useState } from "react";
// import { getVendors } from "./api/getVendors";
import { Pagination } from "./pagination";
// import GoodColumns from "../../public/GoodColumns.json";
import styles from "./DynamicGrid.module.scss";
import {
  ColumnWidths,
  CustomError,
  Log,
  getFromQuery,
  isColumnHidden,
  parseValue,
  setColumnWidths,
  setAllZIndicesToZero,
  setAllZIndicesTo1000,
  getSelectItem,
  getSelectKey,
} from "./utils";
import cn from "classnames";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import vendors from "../../public/vendors.json";
// import properties from "../../public/propOptions.json";
// import accounts from "../../public/accounts.json";
import dimensions from "../../public/Dimensions.json";
import GenericDropdown from "./GenericDropdown";
import { removeAllListeners } from "process";
import { TableHeaderCell } from "./TableHeaderCell";
import { ResultTable } from "./ResultsTable";
import { Payable } from "./dataStructure";
import { TableBodyCell } from "./TableBodyCell";
import SDatePicker from "./SDatePicker";
import { TableBodyCellValue } from "./TableBodyCellValue";

interface DynamicGridProps extends HTMLAttributes<HTMLDivElement> {
  selectItem?: string;
  style?: React.CSSProperties;
  showPagination?: boolean;
  numItems?: number | undefined;
  isActive?: boolean;
  handleInputChange?: React.ChangeEventHandler<HTMLInputElement>;
  getHasValue?: boolean | null;
}

function DynamicGrid<T>({
  selectItem,
  style,
  showPagination,
  numItems,
  isActive,
  className,
  handleInputChange,
  getHasValue,
}: DynamicGridProps) {
  const [data, setData] = React.useState<T[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = React.useState("");
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [numOfItems, setNumOfItems] = React.useState(numItems ?? 1 + 1);
  const [hasValue, setHasValue] = React.useState(getHasValue || false);
  const [text, setText] = useState("");

  const itemsPerPage = 15;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    setNumOfItems((numItems ?? 1) + 1);
    setSelected(selectItem);
    async function fetchData() {
      try {
        let response = [];

        setNumOfItems(numItems ?? 1);
        switch (selectItem) {
          case "GetDimensions":
            response = JSON.parse(
              JSON.stringify(dimensions.slice(0, numOfItems ?? 1))
            );
            setData(response);
            break;
          case "GetFromQuery":
            response = await getFromQuery("total", numOfItems ?? 1);
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

  function handleSort(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    columnName: string
  ) {
    let state = sortState;
    const table = tableRef.current;

    let rows: any[] | NodeListOf<HTMLElement>;

    rows = table && table.querySelectorAll("div[data-row-id]");

    const tableData = {};

    rows.forEach((row, index) => {
      if (index > 0) {
        const rowId = row.getAttribute("data-row-id");

        const cells = row.querySelectorAll('div[class*="td"]');

        tableData[rowId] = {};

        cells.forEach((cell, cellIndex) => {
          const columnId = cell.getAttribute("data-column-id");
          const input = cell.querySelector("input") as HTMLInputElement;

          if (input) {
            tableData[rowId][columnId] = input.value.trim();
          } else {
            tableData[rowId][columnId] = (cell as HTMLElement).innerText.trim();
          }
        });
      }
    });

    const dimensions = Object.values(tableData) as Array<Payable>;
    [...data].forEach((item, index: number) => {
      item[columnName] = dimensions[index][columnName];
    });
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
      });
    }
  }



  function setListeners(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    let pageX: number | undefined;
    let curCol: HTMLElement | null;
    let nxtCol: HTMLElement | null;
    let curColWidth: number | undefined;

    const colDivider = e.target as HTMLElement;
    if (!colDivider.classList.contains(cn(styles["coldivider"]))) return;
    const headerDiv = colDivider.parentElement;
    const table = tableRef.current as HTMLElement;
    setActiveDropdown(dropdownRef.current);
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

        if (currentColumnAllCells)
          currentColumnAllCells.forEach((cell) => {
            const td = cell as HTMLElement;
            td.style.minWidth = (curColWidth ?? 0) + diffX + "px";
            td.style.width = (curColWidth ?? 0) + diffX + "px";
          });

        // table.style.width = (parseInt(table.style.width) ?? 0) + diffX + "px";
        // table.style.width = (parseInt(table.style.width) ?? 0) + diffX + "px";
        // table.style.zIndex = zIndex.toString()
      }

      // (2) move the colDivider on mousemove
      document.addEventListener("mousemove", onMouseMove);

      // (3) drop the colDivider, remove unneeded handlers
      colDivider.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);

        removeAllListeners();
        colDivider.onmouseup = null;
      };
    };

    colDivider.ondragstart = function () {
      return false;
    };

    if (colDivider) {
      colDivider.addEventListener("dblclick", function (e: MouseEvent): void {
        setColumnWidths(tableRef.current as HTMLElement);
      });
    }
  }

  function handleDeleteClick(e) {
    (tableRef.current as HTMLElement)
      .querySelector(
        '[data-row-id="' + (e.target as HTMLElement).dataset.rowId + '"]'
      )
      .remove();
  }

  function handleColumnDeleteClick(e, columnName: string) {
    [
      ...(tableRef.current as HTMLElement).querySelectorAll(
        '[data-column-id="' + columnName + '"]'
      ),
    ].forEach((x) => {
      x.remove();
    });
  }

  function handleChange(e) {
    setText(e.target.value);
  }

  function Render() {
    if (Array.isArray(data) && data.length > 0) {
      const statusHeader = (
        <TableHeaderCell
          key={"STATUS"}
          columnName={"STATUS"}
          onClickDelete={(e) => handleColumnDeleteClick(e, "STATUS")}
        >
          <div className={styles["coldivider"]}></div>
        </TableHeaderCell>
      );

      const columns = Object.keys(data[0]);
      const header = [statusHeader];
      const remainingHeaders = columns.map((cols, idx: number) => {
        return (
          !isColumnHidden(data, cols) && (
            <TableHeaderCell
              key={cols}
              columnName={cols}
              onClick={(e) => handleSort(e, cols)}
              onClickDelete={(e) => handleColumnDeleteClick(e, cols)}
            >
              <div
                className={styles["coldivider"]}
                onMouseEnter={setListeners}
              ></div>
            </TableHeaderCell>
          )
        );
      });

      remainingHeaders.forEach((x) => header.push(x));

      const rows = [...data]
        .slice(
          (currentPage - 1) * itemsPerPage,
          numOfItems < itemsPerPage ? numOfItems : currentPage * itemsPerPage
        )
        .map((row, rowIndex: number) => (
          <div
            key={`${rowIndex + 1}`}
            className={cn(styles["tr"])}
            data-row-id={rowIndex + 1}
            role="row"
          >
            {
              <div
                key={`${"STATUS"}_${rowIndex}`}
                className={styles["td"]}
                data-column-id={"STATUS"}
                style={{ width: "100px" }}
              >
                <span
                  className={cn("material-symbols-outlined", "white")}
                  data-row-id={rowIndex + 1}
                >
                  send
                </span>
              </div>
            }
            {Object.entries(row).map(
              ([key, value]) =>
                !isColumnHidden(data, key) && (
                  <TableBodyCell
                    key={`${key}_${rowIndex}`}
                    columnName={key}
                    rowIndex={rowIndex}
                  >
                    {key.toUpperCase() === "PROPERTY" ||
                    key.toUpperCase() === "ACCOUNT" ||
                    key.toUpperCase() === "PERSON" ? (
                      <GenericDropdown
                        selectItem={getSelectItem(key)}
                        showPagination={true}
                        showCheckbox={false}
                        tableRef={tableRef}
                        columns={columns[getSelectKey(key)]}
                        getHasValue={hasValue}
                        isMultiple={false}
                      ></GenericDropdown>
                    ) : key.toUpperCase() === "DATE" ||
                      key.toUpperCase() === "POSTMONTH" ||
                      key.toUpperCase() === "DUEDATE" ? (
                      <SDatePicker />
                    ) : (
                      parseValue(
                        (value as string)
                          ? value.toString().replace("{InvoiceNumber}", " ")
                          : "",
                        key
                      )
                    )}
                  </TableBodyCell>
                )
            )}{" "}
            {
              <span
                className={cn("material-symbols-outlined", styles["delete"])}
                data-row-id={rowIndex + 1}
                onClick={handleDeleteClick}
              >
                delete
              </span>
            }
          </div>
        ));

      try {
        if (rows.length > 0) {
          const totalPages = Math.ceil(data.length / itemsPerPage);
          return (
            <>
              <div style={style} className={cn(styles["table-container"])}>
                <div
                  id={"gridjs_"}
                  ref={tableRef}
                  className={styles["divTable"]}
                >
                  <div className={cn("rdg-header-row", styles["thead"])}>
                    <div className={styles["tr"]} data-row-id="0">
                      {header}
                    </div>
                  </div>
                  <div key={"tbody"} className={styles["tbody"]}>
                    {rows}
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

  const table = Render();

  function handleDynamicGridMouseEnter(e) {
    setColumnWidths(tableRef.current as HTMLElement);
  }

  function handleMouseOver(e) {
    setAllZIndicesToZero(e.target);
  }

  function handleMouseLeave(e) {
    setAllZIndicesTo1000(e.target);
  }

  if (table && Array.isArray(data) && data.length > 0) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
      <>
        <div
          id="dynamicGridId"
          className={className}
          onMouseEnter={(e) => handleDynamicGridMouseEnter(e)}
          onMouseOver={(e) => handleMouseOver(e)}
          onMouseLeave={(e) => handleMouseLeave(e)}
        >
          {table}
        </div>
      </>
    );
  }
}

export default DynamicGrid;

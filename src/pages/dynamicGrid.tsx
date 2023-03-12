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
  getTableData,
  setAllZIndicesToZero,
  setAllZIndicesTo1000,
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


// export const getServerSideProps: GetServerSideProps<{ data: Payable[] }> = async (context) => {
//   const res = await fetch('public/Dimensions.json')
//   const data: Payable[] = await res.json()

//   Log(data);
//   return {
//     props: {
//       data,
//     },
//   }
// }

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
  // const [goodColumns, setGoodColumns] = React.useState<string[]>([""]);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  // const [isActiveDropdown, setIsActiveDropdown] = React.useState(false);
  const [isActiveTableRef, setIsActiveTableRef] = React.useState(false);
  const [numOfItems, setNumOfItems] = React.useState(numItems ?? 1 + 1);
  const [startDate, setStartDate] = React.useState(new Date());
  const [hasValue, setHasValue] = React.useState(getHasValue || false);
  // const [endDate, setEndDate] = React.useState(new Date());
  // const [inputValue, setInputValue] = React.useState("");

  const itemsPerPage = 10;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  // function handleDropdownOpen(key) {
  //   setActiveDropdown(key);
  // }

  // function handleDropdownClose() {
  //   setActiveDropdown(null);
  // }

  // React.useEffect(() => {
  //   if (selected) {
  //     setGoodColumns(JSON.parse(JSON.stringify(GoodColumns)));
  //   }
  // }, [data]);

  // React.useEffect(() => {
  //   setColumnWidths(tableRef.current)
  // }, [activeDropdown, isActiveTableRef]);

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

  // React.useEffect(() => {
  //   setColumnWidths(tableRef.current as HTMLElement);
  // }, [selected]);

  function handleSort(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    columnName: string
  ) {
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

  // function handleRowClick(e) {
  //   let pageY: number | undefined,
  //     curRow: HTMLElement | null,
  //     nxtRow: HTMLElement | null,
  //     curRowHeight: number | undefined,
  //     nxtRowHeight: number | undefined;
  //   console.log("handleRowClick from dynamicGrid.tsx");
  //   e.preventDefault();
  //   const target = e.target as HTMLElement;
  //   const divTable = document.querySelectorAll(
  //     '[class*="' + cn(styles["ddTable"]) + '"]'
  //   )[0] as HTMLElement;

  //   const tables = [...document.querySelectorAll('[id*="' + "gridjs_" + '"]')];
  //   const table = tables[0] as HTMLElement;
  //   nxtRow = target.parentElement as HTMLElement;
  //   const tmp = nxtRow
  //     ? document.querySelectorAll(
  //         '[data-row-id="' + (parseInt(nxtRow.dataset.rowId) - 1) + '"]'
  //       )
  //     : null;
  //   curRow = tmp ? (tmp[0] as HTMLElement) : null;

  //   pageY = e.pageY;
  //   const padding = curRow ? paddingDiffY(curRow) : 0;

  //   curRowHeight =
  //     curRow && curRow.offsetHeight > 0 && curRow.offsetHeight > padding
  //       ? curRow.offsetHeight - padding
  //       : 0;
  //   nxtRowHeight = divTable ? divTable.offsetHeight - padding : 0;
  //   document.addEventListener("mousemove", function (e3) {
  //     e3.preventDefault();
  //     const diffY = e3.pageY - (pageY ?? 0);

  //     if (curRow) {
  //       let allCells = Array.from(
  //         new Set([
  //           ...divTable.querySelectorAll(
  //             '[data-row-id="' + curRow.dataset.rowId + '"]'
  //           ),
  //         ])
  //       );
  //       if (allCells) {
  //         curRow.style.minHeight = (curRowHeight ?? 0) + diffY + "px";
  //         curRow.style.height = (curRowHeight ?? 0) + diffY + "px";
  //         curRow.style.width = "100%";
  //         allCells.forEach((cell) => {
  //           (cell as HTMLElement).style.minHeight =
  //             (curRowHeight ?? 0) + diffY + "px";
  //           (cell as HTMLElement).style.height =
  //             (curRowHeight ?? 0) + diffY + "px";
  //         });
  //       }
  //     }

  //     if (curRow === undefined && nxtRow.dataset.rowId === "-1") {
  //       let allCells = Array.from(
  //         new Set([
  //           ...divTable.querySelectorAll('[data-row-id="' + "-1" + '"]'),
  //         ])
  //       );

  //       allCells.forEach((cell) => {
  //         (cell as HTMLElement).style.minHeight =
  //           (curRowHeight ?? 0) + diffY + "px";
  //         (cell as HTMLElement).style.height =
  //           (curRowHeight ?? 0) + diffY + "px";
  //       });
  //     }
  //   });
  // }

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

  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
      const columns = Object.keys(data[0]);
      const header = columns.map((cols, idx: number) => {
        return (
          !isColumnHidden(data, cols) && (
            <TableHeaderCell
              key={cols}
              columnName={cols}
              onClick={(e) => handleSort(e, cols)}
            >
              <div
                className={styles["coldivider"]}
                onMouseEnter={setListeners}
              ></div>
            </TableHeaderCell>
          )
        );
      });

      function getSelectItem(key: string) {
        switch (key) {
          case "PROPERTY":
            return "GetPropOptions";
          case "ACCOUNT":
            return "GetAccounts";
          case "PERSON":
            return "GetVendors";
          default:
            return "Property";
        }
      }

      function getSelectKey(key: string) {
        switch (key) {
          case "PROPERTY":
            return "Property";
          case "ACCOUNT":
            return "Account";
          case "PERSON":
            return "Vendor";
          default:
            return "Property";
        }
      }

      function handleDeleteClick(e) {
        (tableRef.current as HTMLElement)
          .querySelector(
            '[data-row-id="' + (e.target as HTMLElement).dataset.rowId + '"]'
          )
          .remove();
      }

      function handleFocus(e) {
        console.info("focusinig element.");
        (e.target as HTMLElement).focus();
      }

      // const handleInputChange = (event) => {
      //   setInputValue(event.target.value);
      // }

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
            <div
              key={`${rowIndex }`}
              className={styles["rowdivider"]}
              // onMouseDown={handleRowClick}
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
                    // onClick={handleFocus}
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
                        onChange={handleInputChange}
                        getHasValue={hasValue}
                        isMultiple={false}
                      />
                    ) : key.toUpperCase() === "DATE" ? (
                      <DatePicker
                        selected={new Date()}
                        onChange={(date) => setStartDate(date)}
                      />
                    ) : key.toUpperCase() === "POSTMONTH" ? (
                      <DatePicker
                        selected={new Date()}
                        onChange={(date) => setStartDate(date)}
                      />
                    ) : key.toUpperCase() === "DUEDATE" ? (
                      <DatePicker
                        selected={new Date()}
                        onChange={(date) => setStartDate(date)}
                      />
                    ) : (
                      parseValue(
                        (value as string)
                          ? value.toString().replace("{InvoiceNumber}", " ")
                          : "",
                        key
                      )
                    )}
                  </div>
                )
            )}{" "}
            {/* {
              <span
                className={cn("material-symbols-outlined", styles["share"])}
                data-row-id={rowIndex + 1}
              >
                ios_share
              </span>
            } */}
            {/* {<span className={cn("material-symbols-outlined", styles["add"])} data-row-id={rowIndex}>content_copy</span>} */}
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

  const table = GenerateTableHtml();

//   function ResultTable( {results: Array<Payable>} ) {
//     if( !results ) {
//         return <div></div>
//     }
//     return (
//         <table className="w-full">
//             <thead>
//                 <tr>
//                     {results[0].columns.map( (c) => <th key={c}>{c}</th>)}
//                 </tr>
//             </thead>
//             <tbody>
//                 {results[0].values.map( (r) => <tr key={r}>
//                     {r.map( (v) => <td key={v}>{v}</td> )}
//                 </tr>)}
//             </tbody>
//         </table>
//     )
// }

  function handleDynamicGridMouseEnter(e) {
    // setActiveDropdown(tableRef.current);
    // setIsActiveTableRef(!isActiveTableRef);
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

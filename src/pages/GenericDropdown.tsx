import React, { HTMLAttributes, useRef, useState } from "react";
// import { getVendors } from "./api/getVendors";
import { Pagination } from "./pagination";
// import { getPropOptionsAsync } from "./api/getPropOptions";
// import { getAccounts } from "./api/getAccounts";
import styles from "./GenericDropdown.module.scss";
import {
  ColumnWidths,
  CustomError,
  Log,
  getDataColumnId,
  headerize,
  isColumnHidden,
  paddingDiff,
  paddingDiffY,
  parseValue,
  setColumnWidths,
  setDropdownGridWidths,
} from "./utils";
import cn from "classnames";
import dimensions from "../../public/Dimensions.json";
import vendors from "../../public/vendors.json";
import properties from "../../public/propOptions.json";
import accounts from "../../public/accounts.json";
import GoodColumns from "../../public/GoodColumns.json";
import { TableBodyCell } from "./TableBodyCell";
import { TableBodyCellValue } from "./TableBodyCellValue";

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

export interface GenericDropdownProps extends HTMLAttributes<HTMLDivElement> {
  selectItem?: string;
  style?: React.CSSProperties;
  showPagination?: boolean;
  showCheckbox?: boolean;
  tableRef?: React.RefObject<HTMLDivElement>;
  itemsPerPage?: number | null;
  numItems?: number | null;
  columns?: string[] | null;
  dropdownValue?: string | null;
  getHasValue?: boolean | null;
  isMultiple?: boolean | null;
  children?: React.ReactNode;
}

function GenericDropdown<T>({
  selectItem,
  style,
  showPagination,
  showCheckbox,
  tableRef,
  itemsPerPage,
  numItems,
  dropdownValue,
  getHasValue,
  isMultiple,
}: GenericDropdownProps) {
  const [data, setData] = React.useState<T[]>([]);
  const [selected, setSelected] = React.useState(selectItem);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isChecked, setIsChecked] = React.useState(true);
  const [showSearchBox, setShowSearchBox] = React.useState(false);
  const [hasPagination] = React.useState(showPagination ?? false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [isActiveDropdown, setIsActiveDropdown] = React.useState(false);
  const [isTableRefActive, setIsTableRefActive] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [hasValue, setHasValue] = React.useState(false);
  const [resetDefaultValue, setResetDefaultValue] = React.useState(
    getHeaderValue(selectItem)
  );
  const [query, setQuery] = React.useState("");

  itemsPerPage = itemsPerPage ?? 15;
  numItems = numItems ?? 100;
  const zIndex = 0;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    setDropdownGridWidths(dropdownRef.current as HTMLElement);
  }, [showSearchBox]);

  React.useEffect(() => {
    // activeDropdown === null && setColumnWidths(tableRef.current as HTMLElement);
    isTableRefActive &&
      !showSearchBox &&
      activeDropdown === tableRef.current &&
      setColumnWidths(tableRef.current as HTMLElement);
  }, [activeDropdown, isTableRefActive, showSearchBox, tableRef]);

  React.useEffect(() => {
    setDropdownGridWidths(dropdownRef.current as HTMLElement);
  }, [sortState]);

  React.useEffect(() => {
    setDropdownGridWidths(dropdownRef.current as HTMLElement);
  }, [currentPage]);

  React.useEffect(() => {
    const searchInput = searchRef.current;
    if (searchInput) {
      searchInput.addEventListener("input", handleSearchInput);
    }
    return () => {
      if (searchInput) {
        searchInput.removeEventListener("input", handleSearchInput);
      }
    };
  }, [query]);

  React.useEffect(() => {
    console.info("Generic Dropdown useEffect ran");
    async function fetchData() {
      try {
        let response = [];

        switch (selectItem) {
          case "GetVendors":
            setData(JSON.parse(JSON.stringify(vendors)));
            break;
          case "GetPropOptions":
            // response = await getPropOptionsAsync(numItems ?? 1);
            setData(JSON.parse(JSON.stringify(properties)));
            break;
          case "GetAccounts":
            // response = await getAccounts(numItems ?? 1);
            setData(JSON.parse(JSON.stringify(accounts)));
            break;
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
    // setColumnWidths();
  }, []);

  function setListeners(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    e.preventDefault();
    const colDivider = e.target as HTMLElement;
    if (!colDivider.classList.contains(cn(styles["coldivider"]))) return;

    if (colDivider) {
      colDivider.addEventListener("dblclick", function (e: MouseEvent): void {
        // setColumnWidths();
      });
    }
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
    }
  }

  function handleGenericDropdownMouseEnter(e) {
    setIsActiveDropdown(true);
    setShowSearchBox(true);
    setIsTableRefActive(false);
    setActiveDropdown(dropdownRef.current);
    setDropdownGridWidths(dropdownRef.current as HTMLElement);
    // const searchInput = document.querySelector(
    //   `#${selected}_label`
    // ) as HTMLElement;
    // searchInput.focus();
  }

  function handleGenericDropdownMouseLeave(e) {
    setIsActiveDropdown(false);
    setActiveDropdown(null);
    setShowSearchBox(false);
    setIsTableRefActive(true);
  }

  function handleClick(e) {
    (e.target as HTMLElement).parentElement.style.zIndex = "0";
    Log(e.target);
    // setSelectedItem(
    //   (e.target as HTMLElement).parentElement.children[2].textContent
    // );

    // const value = (e.target as HTMLElement).parentElement.children[2]
    //   .textContent;
    // value && setInputValue(value);

    // if (dropdownRef?.current) {
    //   const input = dropdownRef.current.querySelector("input");
    //   if (input) input.value = value;
    // }

    setHasValue(true);
    setIsActiveDropdown(false);
    setShowSearchBox(false);
    setIsTableRefActive(true);
    setActiveDropdown(tableRef.current);
  }

  function handleClickAll(e) {
    (e.target as HTMLElement).style.zIndex = "0";
    setSelectedItem(
      (e.target as HTMLElement).parentElement.children[2].textContent
    );
    const value = (e.target as HTMLElement).parentElement.children[2]
      .textContent;
    // value && setInputValue(value);

    if (dropdownRef?.current) {
      const input = dropdownRef.current.querySelector("input");
      if (input) input.value = value;
    }

    if (tableRef?.current) {
      const allCells = Array.from(
        new Set([
          ...(tableRef.current as HTMLElement).querySelectorAll(
            'div[data-column-id="' +
              getDataColumnId(selectItem) +
              '"][class*="td"]'
          ),
        ])
      );

      allCells.forEach((cell) => {
        const children = Array.from(
          new Set([...(cell as HTMLElement).children])
        );

        children.forEach((child) => {
          (child as HTMLElement).querySelectorAll("input")[0].value = value;
          (child as HTMLElement).querySelectorAll("input")[0].textContent =
            value;
          // const span = document.createElement("span");
          // span.textContent = "close";
          // span.classList.add("material-symbols-outlined", "red");
          // span.style.alignItems = "center";
          // span.style.justifyContent = "center";
          // const input = (child as HTMLElement).querySelector("input");
          // const spanParent = input.parentElement.querySelector("span");
          // spanParent.insertAdjacentElement("afterend", span);
          // span.addEventListener("click", handleResetDefaultValue);
        });
      });
    }
    setHasValue(true);
    setIsActiveDropdown(false);
    setShowSearchBox(false);
    setIsTableRefActive(true);
    setActiveDropdown(tableRef.current);
  }

  function handleRowMouseOver(e) {
    const target = e.target as HTMLElement;
    target.classList.add(styles["hover"]);
  }

  const handleResetDefaultValue = (e) => {
    setHasValue(false);
    setResetDefaultValue(getHeaderValue(selectItem));
    setSelectedItem(selectItem);
    setInputValue(getHeaderValue(selectItem));

    if (dropdownRef?.current) {
      const input = dropdownRef.current.querySelector("input");
      if (input) input.value = getHeaderValue(selectItem);
    }
    setIsActiveDropdown(false);
    setShowSearchBox(false);
    setIsTableRefActive(true);
    setActiveDropdown(tableRef.current);
  };

  const handleResetDefaultValueAll = (e) => {
    setHasValue(false);
    setResetDefaultValue(getHeaderValue(selectItem));
    setSelectedItem(selectItem);
    setInputValue(getHeaderValue(selectItem));

    if (dropdownRef?.current) {
      const input = dropdownRef.current.querySelector("input");
      if (input) input.value = getHeaderValue(selectItem);
    }
    setIsActiveDropdown(false);
    setShowSearchBox(false);
    setIsTableRefActive(true);
    setActiveDropdown(tableRef.current);
  };

  function handleShowSearchBox(e) {
    setActiveDropdown(dropdownRef.current);
    const container = (dropdownRef.current as HTMLElement).parentElement
      .parentElement;
    container.style.zIndex = "1001";
    // setAllZIndexesHigh();

    setShowSearchBox(true);
  }

  function handleMouseLeaveSearchBox(e) {
    const container = (dropdownRef.current as HTMLElement).parentElement
      .parentElement;
    container.style.zIndex = "0";
    // setAllZIndexesLow();
    setActiveDropdown(null);
    setShowSearchBox(false);
  }

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };

  function Checkbox({}) {
    return (
      <label>
        <br />
        <input
          id="checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheckboxChange(e)}
        />
      </label>
    );
  }

  function getHeaderValue(selectItem: string): string {
    switch (selectItem) {
      case "GetVendors":
        return "Vendors";
      case "GetPropOptions":
        return "Properties";
      case "GetAccounts":
        return "Accounts";
      case "GetDimensions":
        return "Dimensions";
      case "GetFromQuery":
        return "Query";
      default:
        return selected;
    }
  }

  function handleSearchInput(e) {
    const allRows =
      searchRef.current.parentElement.parentElement.parentElement.querySelectorAll(
        `.${cn(styles["tr"])}`
      ) as NodeListOf<HTMLElement>;
    const cells =
      searchRef.current.parentElement.parentElement.parentElement.querySelectorAll(
        `.${cn(styles["td"])}`
      ) as NodeListOf<HTMLElement>;

    const rowsWithData = [];
    // get rid of the header row so we don't remove it
    Array.from(allRows).slice(1);

    const myQuery = e.target.value.toLowerCase();
    setQuery(myQuery);
    cells.forEach((cell) => {
      cell.textContent.toLowerCase().includes(myQuery) &&
        rowsWithData.push(cell.parentElement);
    });

    allRows.forEach((row) => {
      if (rowsWithData.includes(row)) {
        row.style.display = "block";
      } else {
        Log(row.classList);
        if (
          !row.children[0].classList.contains(cn(styles["th"])) &&
          !row.classList.contains("tfoot")
        )
          row.style.display = "none";
      }
    });
  }

  function handleChange(e) {
    setInputValue(e.target.value);
  }

  function Render() {
    if (Array.isArray(data) && data.length > 0) {
      const myType =
        selected === "GetPropOptions"
          ? "Property"
          : selected === "GetVendors"
          ? "Vendor"
          : selected === "GetAccounts"
          ? "Account"
          : null;

      if (!myType) return null;
      const myColumns = GoodColumns[myType];

      const columnKeys = Object.entries(myColumns).map(
        ([key, value], index: number) => {
          return { Item: myType, Index: index, Name: value["Name"] };
        }
      );

      const filteredColumns = myType && columnKeys.map((col) => col.Name);

      const headerRow = [...filteredColumns].map((col, index: number) => (
        <div
          key={col}
          className={styles["th"]}
          style={{ width: "100px" }}
          data-column-id={col}
          hidden={isColumnHidden(data, col)}
        >
          {headerize(col)}
          <span
            className={`${"material-symbols-outlined"} ${styles["black"]}`}
            onClick={() => handleSort(col)}
          >
            {!sortState ? "expand_more" : "expand_less"}
          </span>
          <div
            className={styles["coldivider"]}
            onMouseEnter={setListeners}
          ></div>
        </div>
      ));

      const filteredData =
        filteredColumns &&
        data.map((obj) => {
          const filteredProps = {};
          Object.keys(obj).forEach((key) => {
            if (filteredColumns.includes(key)) {
              filteredProps[key] = obj[key];
            }
          });
          return filteredProps;
        });

      const rows = [...filteredData]
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((row, rowIndex: number) => (
          <div
            id={row[columnKeys[0].Name]}
            key={row[columnKeys[0].Name]}
            data-row-id={rowIndex + 1}
            className={cn(styles["tr"])}
            onMouseOver={handleRowMouseOver}
          >
            <div key={`${rowIndex}`} className={styles["rowdivider"]}></div>
            {Object.entries(row).map(
              ([key, val]) =>
                !isColumnHidden(data, key) && (
                  <TableBodyCell
                    key={`${key}_${rowIndex}`}
                    columnName={key}
                    rowIndex={rowIndex}
                    onClick={isMultiple ? handleClickAll : handleClick}
                  >
                    {parseValue(val as string, key)}
                  </TableBodyCell>
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
                  key={"gridjs_0"}
                  className={styles["ddTable"]}
                >
                  <div className={styles["thead"]}>
                    {
                      <div className={"search-panel"}>
                        <input
                          id="search-input"
                          type="search"
                          className={styles["findcomponent"]}
                          placeholder=" Search..."
                          autoComplete="on"
                          onChange={handleSearchInput}
                        ></input>
                        <span
                          className={cn(
                            "material-symbols-outlined",
                            styles["searchicon"]
                          )}
                        >
                          {"search"}
                        </span>
                      </div>
                    }
                  </div>
                  <div
                    className={cn(styles["tr"], styles["th"])}
                    data-row-id="0"
                  >
                    {headerRow}
                  </div>

                  <div key={"tbody"} className={styles["tbody"]}>
                    {rows.slice(1)}
                  </div>
                  {hasPagination && (
                    <div className={cn(styles["tr"], "tfoot")}>
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
          return <>{error.message}</>;
        } else {
          // handle other types of errors
          throw error;
        }
      }
    }
  }

  const table = Render();

  if (table && Array.isArray(data) && data.length > 0) {
    return (
      <div
        onMouseEnter={(e) => handleGenericDropdownMouseEnter(e)}
        onMouseLeave={(e) => handleGenericDropdownMouseLeave(e)}
      >
        {showCheckbox && <Checkbox />}
        <div
          onMouseEnter={handleShowSearchBox}
          onMouseLeave={handleMouseLeaveSearchBox}
          ref={dropdownRef}
        >
          <div className="dropdown" style={{ maxWidth: "125px" }}>
            <label
              style={{
                display: "inline-flex",
                borderRadius: `${hasPagination ? "6px" : "0px"}`,
              }}
            >
              <input
                ref={searchRef}
                readOnly={true}
                defaultValue={getHeaderValue(selectItem)}
                style={{ width: "100%", userSelect: "none" }}
              />
              <span
                className={cn("material-symbols-outlined", "white")}
                style={{
                  color: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showSearchBox ? "expand_more" : "expand_less"}
              </span>
              {hasValue && (
                <span
                  className={cn("material-symbols-outlined", "red")}
                  onClick={
                    isMultiple
                      ? handleResetDefaultValueAll
                      : handleResetDefaultValue
                  }
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  close
                </span>
              )}
            </label>
          </div>
          <div
            className={
              !showSearchBox && isChecked
                ? `${styles["dropdown-content-hidden"]}`
                : `${styles["dropdown-content"]}`
            }
          >
            {showSearchBox && isChecked && <>{table}</>}
            {!isChecked && <div>{table}</div>}
          </div>
        </div>
      </div>
    );
  }
}

export default GenericDropdown;

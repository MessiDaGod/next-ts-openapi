import React, { useRef } from "react";
// import { getVendors } from "./api/getVendors";
import { Pagination } from "./pagination";
// import { getPropOptionsAsync } from "./api/getPropOptions";
// import { getAccounts } from "./api/getAccounts";
import styles from "./DynamicGrid.module.scss";
import stylesWithin from "./GenericDropdown.module.scss";
import { ColumnWidths, CustomError, isColumnHidden, parseValue } from "./utils";
import cn from "classnames";
import dimensions from "../../public/Dimensions.json";
import vendors from "../../public/vendors.json";
import properties from "../../public/propOptions.json";
import accounts from "../../public/accounts.json";
import GoodColumns from "../../public/GoodColumns.json";
import { removeAllListeners } from "process";


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
  showCheckbox?: boolean;
  tableRef: React.RefObject<HTMLDivElement>;
  itemsPerPage?: number | null;
  numItems?: number | null;
  columns?: string[] | null;
}

function GenericDropdown<T>({
  selectItem,
  style,
  showPagination,
  showCheckbox,
  tableRef,
  itemsPerPage,
  numItems,
}: DynamicGridProps) {
  const [data, setData] = React.useState<T[]>([]);
  const [selected, setSelected] = React.useState(selectItem);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isChecked, setIsChecked] = React.useState(true);
  const [showSearchBox, setShowSearchBox] = React.useState(false);
  const [hasPagination] = React.useState(showPagination ?? false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [isActiveDropdown, setIsActiveDropdown] = React.useState(false);
  itemsPerPage = itemsPerPage ?? 10;
  numItems = numItems ?? 100;
  const zIndex = 0;

  function handlePageChange(page: number) {
    setCurrentPage(page);
    setColumnWidths();
  }

  React.useEffect(() => {
    setColumnWidths();
  }, [isActiveDropdown]);

  React.useEffect(() => {
    console.info("setting column widths with selected, numOfItems, data...")
    setColumnWidths();
  }, [currentPage]);

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
    setColumnWidths();
  }, []);


  function setListeners(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation()
    e.preventDefault();
    const colDivider = e.target as HTMLElement;
    if (!colDivider.classList.contains(cn(styles["coldivider"]))) return;

    if (colDivider) {
      colDivider.addEventListener("dblclick", function (e: MouseEvent): void {
        setColumnWidths();
      });
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

  function setColumnWidths() {
    if (!tableRef) return;
    const current = tableRef.current;

    const tables = [...current.querySelectorAll('[id*="' + "gridjs" + '"]')];
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
        (ruler as HTMLElement).style.zIndex = zIndex.toString();
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
            (col as HTMLElement).style.minHeight = "0px";
            (col as HTMLElement).style.zIndex = zIndex.toString();
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
      (table as HTMLElement).style.zIndex = zIndex.toString();
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
    if (divTable) {
      let allrows = Array.from(
        new Set([...divTable.querySelectorAll('[data-row-id*=""]')])
      );
      allrows.forEach((row) => {
        (row as HTMLElement).style.minHeight = "0px";
        (row as HTMLElement).style.padding = "0px";
        (row as HTMLElement).style.zIndex = zIndex.toString();
      });
    }
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

  function handleOnClick(e) {
    const div = e.target as HTMLElement;
    setSelectedItem(div.parentElement.children[2].textContent);
    setIsActiveDropdown(false);
    setShowSearchBox(false);
  }

  function handleRowMouseOver(e) {
    const target = e.target as HTMLElement;
    target.classList.add(styles["hover"]);
  }

  interface IColumn {
    Id: number;
    Col1: string;
    Col2: string;
  }

  function createColumnsFromJson(json) {
    const columns = {};
    for (const key in json) {
      if (Object.hasOwnProperty.call(json, key)) {
        columns[key] = json[key].map((col) => col.Name);
      }
    }
    return columns;
  }

  function GenerateTableHtml() {
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
          {col}
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

      // const IColumns = createColumnsFromJson(GoodColumns);
      // console.log(IColumns);
      // console.log(columnKeys);
      const rows = [...filteredData]
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((row, rowIndex: number) => (
          <div
            id={row[columnKeys[0].Name]}
            key={row[columnKeys[0].Name]}
            data-row-id={rowIndex}
            className={cn(stylesWithin["tr"])}
            onMouseOver={handleRowMouseOver}
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
                    id={`td_${row[columnKeys[0].Name]}_${index}`}
                    key={`td_${row[columnKeys[0].Name]}_${index}`}
                    className={stylesWithin["td"]}
                    data-column-id={key}
                    style={{ width: "100px" }}
                    onClick={handleOnClick}
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
                  key={"gridjs_0"}
                  className={styles["ddTable"]}
                >
                  <div className={styles["thead"]}></div>
                  {
                    <div className={stylesWithin["search-panel"]}>
                      <input
                        id="search-input"
                        type="search"
                        className={styles["findcomponent"]}
                        placeholder="Search..."
                        autoComplete="on"
                      ></input>
                        <span
                          className={cn("material-symbols-outlined", styles["searchicon"])}
                        >
                          {"search"}
                        </span>
                    </div>
                  }

                  <div className={styles["tr"]} data-row-id="0">
                    {headerRow}
                  </div>

                  <div key={"tbody"} className={styles["tbody"]}>
                    {rows.slice(1)}
                  </div>
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
          return <>{error.message}</>;
        } else {
          // handle other types of errors
          throw error;
        }
      }
    }
  }

  function handleShowSearchBox(e) {
    setActiveDropdown(dropdownRef.current);
    (dropdownRef.current as HTMLElement).style.zIndex = "1000";
    (dropdownRef.current as HTMLElement).parentElement.style.zIndex = "1000";
    const container = (dropdownRef.current as HTMLElement).parentElement.parentElement;
    container.querySelector('[class*="' + cn(styles["dd-container"]) + '"]') as HTMLElement;
    container.style.zIndex = "1000";
    setColumnWidths();
    setShowSearchBox(true);
  }

  function handleMouseLeaveSearchBox(e) {
    (dropdownRef.current as HTMLElement).style.zIndex = "0";
    (dropdownRef.current as HTMLElement).parentElement.style.zIndex = "0";
    const container = (dropdownRef.current as HTMLElement).parentElement.parentElement;
    container.querySelector('[class*="' + cn(styles["dd-container"]) + '"]') as HTMLElement;
    container.style.zIndex = "0";
    setActiveDropdown(null);
    setShowSearchBox(false);
  }

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

  function search(): void {
    const searchInput = document.querySelector(`#${selected}_label`);
    searchInput?.addEventListener("input", handleSearchInput);

    function handleSearchInput() {
      const sidebarItems = document.querySelectorAll(
        `.${cn(styles["td"])}`
      ) as NodeListOf<HTMLElement>;
      let input = searchInput as HTMLInputElement;
      const query = input.value.toLowerCase();

      for (const item of sidebarItems) {
        if (item) {
          let newItem = item as HTMLElement;
          if (newItem && newItem.dataset.columnId) {
            const title = newItem.dataset.columnId.toString().toLowerCase();
            if (title.includes(query)) {
              item.style.display = "block";
            } else {
              item.style.display = "none";
            }
          }
        }
      }
    }
  }

  const table = GenerateTableHtml();

  function handleGenericDropdownMouseEnter(e) {
    setIsActiveDropdown(true);
    setShowSearchBox(true);
    setActiveDropdown(dropdownRef.current);
    setColumnWidths();
  }

  function handleGenericDropdownMouseLeave(e) {
    setIsActiveDropdown(false);
    setActiveDropdown(null);
    setShowSearchBox(false);
  }

  if (table && Array.isArray(data) && data.length > 0) {
    return (
      <div
        style={style}
        onMouseEnter={(e) => handleGenericDropdownMouseEnter(e)}
        onMouseLeave={(e) => handleGenericDropdownMouseLeave(e)}
      >
        {showCheckbox && <Checkbox />}
        <div
          className={`${styles["dropdown"]}`}
          onMouseEnter={handleShowSearchBox}
          onMouseLeave={handleMouseLeaveSearchBox}
          ref={dropdownRef}
        >
          <label
            id={`${selected}_label`}
            className={`${styles["rz-placeholder"]}`}
            style={{
              padding: "0",
              margin: "0",
              cursor: "pointer",
              overflow: "hidden",
              zIndex: "0",
              borderRadius: `${hasPagination ? "6px" : "0px"}`,
            }}
          >
            {selectedItem ? selectedItem : getHeaderValue(selected)}
            <span
              className={"material-symbols-outlined"}
              style={{
                color: "white",
                display: "inline-block",
              }}
            >
              {showSearchBox ? "expand_more" : "expand_less"}
            </span>
          </label>
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
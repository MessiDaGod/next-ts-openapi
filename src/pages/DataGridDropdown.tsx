import React, { useState } from "react";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { emptyPropOptions, PropOptions } from "./api/Objects/PropOptions";
import styles from "../styles/DataGridDropdown.module.scss";
import { isColumnHidden, parseValue } from "./utils";
import { Pagination } from "@/pages/pagination";

type DropdownProps = {
  data?: {
    Id: number;
    Property_Code: string;
    Property_Name: string;
    Type: string;
    StringValue: string;
    HandleValue: string;
    HandleValueInt: number | null;
    Date: string | null;
  }[];
};

interface DataSet {
  [key: number]: number | undefined;
  row: number | undefined;
  columnName: string | undefined;
  columnIndex: number | undefined;
  value: string | undefined;
  columnCount: number | undefined;
  rowCount: number | undefined;
}

function getGoodColumns(): Promise<string[]> {
  return fetch("/GoodColumns.json")
    .then((response) => response.json())
    .then((data) => data.map((item: any) => item.Name));
}

const DataGridDropdown: React.FC<DropdownProps> = ({}) => {
  const [data, setData] = React.useState<PropOptions[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  //   const [isResized, setIsResized] = useState<Boolean>(false);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isChecked, setIsChecked] = useState(true);
  const itemsPerPage = 10;
  const cache = new Map<string, any>();

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPropOptionsAsync(1000);
        const items = JSON.parse(JSON.stringify(response));
        setData(items);
        setIsChecked(false);
      } catch (error) {
        return emptyPropOptions;
      }
    }
    fetchData();
  }, []);

  function getCachedValue(key: string, getValueFunction: () => any): any {
    let value = cache.get(key);

    if (value === undefined) {
      value = getValueFunction();
      cache.set(key, value);
    }

    return value;
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

  let pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    prevCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined,
    prevColWidth: number | undefined;

  function handleMouseEnter(e) {
    e.preventDefault();
    const colDividerDiv = e.target;
    const divTh = colDividerDiv.parentElement;
    let headers = [...document.querySelectorAll('div[class*="' + "th" + '"]')];
    headers.forEach((header) => {
      if (header.getAttribute("hidden") === null) {
        header.addEventListener("mousedown", handleMouseDown);
        header.addEventListener("mouseup", handleMouseUp);
      }
    });
    const tables = [...document.querySelectorAll('[id^="' + "gridjs_" + '"]')];

    curCol = divTh;
    nxtCol = curCol.nextElementSibling as HTMLElement;
    if (divTh) prevCol = curCol.previousElementSibling as HTMLElement;
    pageX = e.pageX;
    let padding = curCol ? paddingDiff(curCol) : 0;

    curColWidth =
      curCol && curCol.offsetWidth > 0 && curCol.offsetWidth > padding
        ? curCol.offsetWidth - padding
        : 0;

    if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;

    if (prevCol) prevColWidth = prevCol.offsetWidth - padding;
    console.log(nxtCol?.firstChild);
  }

  function handleMouseDown(e) {
    e.preventDefault();
    const colDividerDiv = e.target;
    const divTh = colDividerDiv.parentElement;

    const tables = [...document.querySelectorAll('[id^="' + "gridjs_" + '"]')];

    curCol = divTh;
    nxtCol = curCol.nextElementSibling as HTMLElement;
    if (divTh) prevCol = curCol.previousElementSibling as HTMLElement;
    pageX = e.pageX;
    let padding = curCol ? paddingDiff(curCol) : 0;

    curColWidth =
      curCol && curCol.offsetWidth > 0 && curCol.offsetWidth > padding
        ? curCol.offsetWidth - padding
        : 0;

    if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;

    if (prevCol) prevColWidth = prevCol.offsetWidth - padding;

    let diffX = e.pageX - (pageX ?? 0) ?? 0;
    divTh.addEventListener(
      "mousemove",
      function (e: MouseEvent): void {
        e.preventDefault();
        const diffX = e.pageX - (pageX ?? 0);
        const tables = [
          ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
        ];

        if (curCol) {
          const allCells = Array.from(
            new Set([
              ...tables[0].querySelectorAll(
                '[data-column-id="' + curCol.dataset.columnId + '"]'
              ),
            ])
          );
          curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
          curCol.style.width = (curColWidth ?? 0) + diffX + "px";

          if (allCells)
            allCells.forEach((cell) => {
              (cell as HTMLElement).style.minWidth =
                (curColWidth ?? 0) + diffX + "px";
              (cell as HTMLElement).style.width =
                (curColWidth ?? 0) + diffX + "px";
            });
        }

        if (nxtCol) {
          nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
          nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";

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
      },
      { once: false, passive: false }
    );
  }

  function handleMouseUp(e) {
    e.target.addEventListener("mouseup", function (e: MouseEvent): void {
      let headers = [
        ...document.querySelectorAll('div[class*="' + "th" + '"]'),
      ];
      headers.forEach((header) => {
        if (header.getAttribute("hidden") === null) {
          header.removeEventListener("mousedown", handleMouseDown);
          header.removeEventListener("mouseup", handleMouseUp);
        }
      });
    });
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
                key={`${name}${idx}${index}`}
                className={styles["th"]}
                style={{ width: "100px" }}
                data-column-id={item.columnName}
                hidden={isColumnHidden(data, item.columnName)}
                onMouseEnter={handleMouseEnter}
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
          return <div key={idx}>{columnNamesWithLineBreaks}</div>;
        }),
        ...data
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((_row, rowIndex: number) => (
            <div key={`${rowIndex}`} className={styles["tr"]}>
              {Object.entries(_row).map(([key, value], index: number) => (
                <div
                  key={`${key}_${rowIndex}_${index}`}
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
            <div
              id="gridjs_0"
              className={styles["divTable"]}
              style={{ overflow: "auto" }}
            >
              <div className={styles["thead"]}>
                {(
                  <input
                    id="search-input"
                    type="search"
                    className={styles["rz-textbox findcomponent"]}
                    placeholder="Search ..."
                    autoComplete="on"
                    style={{
                      color: "white",
                      backgroundColor: "inherit",
                      fontSize: "14px",
                      borderBottom: "1px solid #2f333d",
                      borderTop: "1px solid #2f333d",
                      cursor: "text",
                      display: "block",
                      width: "100%",
                      padding: "10px",
                    }}
                  ></input>
                )}
                <div className={styles["tr"]}>{tableRows[0]}</div>
              </div>
              <div className={styles["tbody"]}>
                {tableRows.slice(1)}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </>
        );
      }
    }
  }

  const table = GenerateTableHtml();
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  function Checkbox({ isChecked: boolean }) {
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
    <div>
      <Checkbox isChecked={isChecked} />
      <div
        className={`${styles["dropdown"]} ${styles["rz-dropdown"]}`}
        onMouseEnter={() => setShowSearchBox(true)}
        onMouseLeave={() => setShowSearchBox(false)}
      >
        <label
          className={`${styles["rz-placeholder"]}`}
          style={{
            width: "100%",
            cursor: "pointer",
            color: "var(--rz-input-value-color)",
            backgroundColor: "#1e1e1e",
            padding: "10px",
            border: "1px solid #c9c3c3",
            borderRadius: "6px",
          }}
        >
          &nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span
            className={"material-symbols-outlined"}
            style={{
              color: "white",
              background: "transparent",
              display: "inline-block",
              transform: "translateY(25%)",
            }}
          >
            {showSearchBox ? "expand_more" : "expand_less"}
          </span>
        </label>
        <div className={styles["dropdown-content"]}>
          {!isChecked && (() => setShowSearchBox(true)) && <div>{table}</div>}
          {showSearchBox && isChecked && <div>{table}</div>}
        </div>
      </div>
    </div>
  );
};

export default DataGridDropdown;

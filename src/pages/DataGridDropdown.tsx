import React, { useState } from "react";
import { getPropOptionsAsync } from "./api/getPropOptions";
import { emptyPropOptions, PropOptions } from "./api/Objects/PropOptions";
import styles from "../styles/DataGridDropdown.module.scss";
import PropOptionsPage from "./propOptions";
import { dataGridResize, setListeners } from "./api/resize";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import { isColumnHidden, isRowEmpty, parseValue } from "./utils";
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

  function handleMouseEnter(e) {
    const target = e.target;
    setListeners(target as HTMLDivElement);
  }

  function handleMouseMove(e) {

  }
  function handleMouseUp(e) {

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
                id={`${name}${idx}${index}`}
                key={`${name}${idx}${index}`}
                className={styles["th"]}
                style={{ width: "100px" }}
                data-column-id={item.columnName}
                hidden={isColumnHidden(data, item.columnName)}
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
                  onMouseEnter={handleMouseEnter}
                //   onMouseMove={handleMouseMove}
                //   onMouseUp={handleMouseUp}
                ></div>
              </div>
            )
          );

          return <div key={`${idx}`}>{columnNamesWithLineBreaks}</div>;
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
            <div id="gridjs_0" className={styles["divTable"]}>
              <div className={styles["thead"]}>
                {showSearchBox && (
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
          onChange={(e) => handleCheckboxChange(e)} />Dropdown with MouseEnter
      </label>
    );
  }

  return (
    <>
      <Checkbox
        isChecked={isChecked}
      />
      {/* <p style={{ color: "red" }}>Is Checked: {`${isChecked}`}</p> */}
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
          {showSearchBox && isChecked && <div>{table}</div>}
          {!isChecked && <div>{table}</div>}
        </div>
      </div>
    </>
  );
};

export default DataGridDropdown;

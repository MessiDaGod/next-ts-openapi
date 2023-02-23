import React, { useState } from "react";
import { getPropOptions } from "./api/getPropOptions";
import { emptyPropOptions, PropOptions } from "./api/Objects/PropOptions";
import styles from "../styles/propertyDropdown.module.scss";
import PropOptionsPage from "./propOptions";
import { dataGridResize } from "./api/dataGridResize";
import { DataTable, GetDataDictionary } from "./api/DataObject";
import { isColumnHidden, isRowEmpty, parseValue } from "./utils";
import { Pagination } from "@/pagination";

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

const PropertyDropdown: React.FC<DropdownProps> = ({}) => {
  const [data, setData] = React.useState<PropOptions[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const itemsPerPage = 25;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPropOptions(1000);
        const items = JSON.parse(JSON.stringify(response));
        setData(items);
      } catch (error) {
        return emptyPropOptions;
      }
    }
    fetchData();
    dataGridResize();
  }, [showSearchBox]);

  const filteredData = Array.isArray(data)
    ? data.filter(
        (item) =>
          item.Property_Code.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          item.Property_Name.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase())
      )
    : data;

  function GeneratePropOptionsData(
    data: PropOptions | PropOptions[]
  ): DataTable<PropOptions> | undefined {
    const json = JSON.stringify(data);
    const PropOptions: PropOptions[] = JSON.parse(json).map(
      (PropOptions: PropOptions) => ({
        ...PropOptions,
      })
    );

    if (PropOptions.length > 0) {
      const newPropOptions = GetDataDictionary(PropOptions);
      PropOptions.forEach((PropOptions) => {
        Object.entries(PropOptions).forEach(([key, value]) => {
          newPropOptions.values[key].Values.push(value);
        });
      });

      return newPropOptions;
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
                  className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
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
            <div style={{ overflow: "auto" }}>
              <div id="gridjs_0" className={styles["divTable"]}>
                <div className={styles["thead"]}>
                  <div className={styles["tr"]}>{tableRows[0]}</div>
                </div>
                <div className={styles["tbody"]}>{tableRows.slice(1)}</div>
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
  const totalPages = Math.ceil(data.length / itemsPerPage);
  return (
    <div
      className={`${styles["dropdown"]} ${styles["rz-dropdown"]}`}
      onMouseEnter={() => setShowSearchBox(true)}
      onMouseLeave={() => setShowSearchBox(false)}
    >
      <div className={styles["rz-helper-hidden-accessible"]}>
      </div>
      <label
        className={`${styles["rz-placeholder"]} ${styles["rz-inputtext"]} ${styles["rz-dropdown-label"]}`}
        style={{ width: "100%" }}
      >
        Property
      </label>
      <div className={styles["dropdown-content"]}>
        {showSearchBox && <div>{table}</div>}
      </div>
    </div>
  );
};

export default PropertyDropdown;

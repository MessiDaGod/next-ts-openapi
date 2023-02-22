import React from "react";
import styles from "../styles/yardiInterface.module.scss";
import { dataGridResize } from "./api/dataGridResize";
import { Vendor, emptyVendor } from "./api/Objects/Vendor";
import { getVendors } from "./api/getVendors";
import { GetDataDictionary, DataTable } from "./api/DataObject";
import { Pagination } from "../pagination";
import { parseValue } from "./utils";


function getGoodColumns(): Promise<string[]> {
  return fetch("/GoodColumns.json")
    .then((response) => response.json())
    .then((data) => data.map((item: any) => item.Name));
}

interface DataSet {
  [key: number]: number | undefined;
  row: number | undefined;
  columnName: string | undefined;
  columnIndex: number | undefined;
  value: string | undefined;
  columnCount: number | undefined;
  rowCount: number | undefined;
}

function Vendors() {
  const [data, setData] = React.useState<Vendor | Vendor[]>([]);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  // const [itemsPerPage, setItemsPerPage] = React.useState<number>(25);

  const itemsPerPage = 25;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getVendors(1000);
        setData(response);
        console.log("useEffect");
      } catch (error) {
        return emptyVendor;
      }
    }
    fetchData();
    dataGridResize();
  }, []);

  function GenerateVendorData(
    data: Vendor | Vendor[]
  ): DataTable<Vendor> | undefined {
    const json = JSON.stringify(data);
    const vendors: Vendor[] = JSON.parse(json).map((vendor: Vendor) => ({
      ...vendor,
    }));

    if (vendors.length > 0) {
      const newVendors = GetDataDictionary(vendors);
      vendors.forEach((vendor) => {
        Object.entries(vendor).forEach(([key, value]) => {
          newVendors.values[key].Values.push(value);
        });
      });

      return newVendors;
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

  const goodColumns = getGoodColumns();

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
          const columnNamesWithLineBreaks = columnNames.map((name) => (
            <div
              key={`${name}${idx}`}
              className={styles["th"]}
              style={{ width: "100px" }}
              data-column-id={item.columnName}
            >
              {name}{" "}
              <span
                className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
                onClick={() => handleSort(item.columnName)}
                style={{
                  color: "white",
                  background: "transparent",
                }}
              >
                {!sortState ? "expand_more" : "expand_less"}
              </span>
              <div key={`${name}${idx}`}
                className={styles["coldivider"]}
                // onMouseDown={handleMouseDown}
              ></div>
            </div>
          ));

          return <>{columnNamesWithLineBreaks}</>;
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
                >
                  {parseValue(value as string, key)}
                </div>
              ))}
            </div>
          )),
      ];

      if (tableRows.length > 0) {
        return (
          <div style={{ overflow: "auto" }}>
            <div id="gridjs_0" className={styles["divTable"]}>
              <div className={styles["thead"]}>
                <div className={styles["tr"]}>{tableRows[0]}</div>
              </div>
              <div className={styles["tbody"]}>{tableRows.slice(1)}</div>
            </div>
          </div>
        );
      }
    }
  }

  const table = GenerateTableHtml();

  if (table && Array.isArray(data) && data.length > 0) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
      <React.Fragment>
        <>
          <div className={styles["datagriddiv"]}>
            <i id="ruler" hidden></i>
            {table}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      </React.Fragment>
    );
  }

  function isRowEmpty<T>(row: T): boolean {
    if (!row) return true;
    return Object.values(row).every(
      (value) =>
        value === null ||
        value === "" ||
        value === "0" ||
        value === "-1" ||
        value === "0.000000" ||
        value === "NULL" ||
        value === 0
    );
  }

  function isColumnHidden(columnName: string): boolean {
    if (Array.isArray(data)) {
      const columnData = data.map((row) => row[columnName]);
      return columnData.every(
        (value) =>
          value === null ||
          value === "" ||
          value === "0" ||
          value === "-1" ||
          value === "0.000000" ||
          value === "NULL" ||
          value === 0
      );
    } else {
      return true;
    }
  }
}

export default Vendors;
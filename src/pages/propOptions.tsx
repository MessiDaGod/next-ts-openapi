import React from "react";
import styles from "../styles/Home.module.scss";
import { dataGridResize } from "./api/dataGridResize";
import { PropOptions, emptyPropOptions } from "./api//Objects/PropOptions";
import { getPropOptions } from "./api/getPropOptions";
import { GetDataDictionary, DataTable } from "./api/DataObject";
import { Pagination } from "../pagination";

function handleSetData() {
  dataGridResize();
}

function PropOptionsPage() {
    const [data, setData] = React.useState<PropOptions | PropOptions[]>([]);
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
    }, []);

    React.useEffect(() => {
        handleSetData();
    });

    function GeneratePropOptionsData(
        data: PropOptions | PropOptions[]
    ): DataTable<PropOptions> | undefined {
        const json = JSON.stringify(data);
        const PropOptionss: PropOptions[] = JSON.parse(json).map(
            (PropOptions: PropOptions) => ({
                ...PropOptions,
            })
        );

        if (PropOptionss.length > 0) {
            const newPropOptionss = GetDataDictionary(PropOptionss);
            PropOptionss.forEach((PropOptions) => {
                Object.entries(PropOptions).forEach(([key, value]) => {
                    newPropOptionss.values[key].Values.push(value);
                });
            });

            return newPropOptionss;
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


    function GenerateTableHtml() {
        if (Array.isArray(data)) {
            const newPropOptionss = GeneratePropOptionsData(data);
            if (!newPropOptionss)
                return;

            // Pagination logic

            const tableRows = [
                newPropOptionss.columns.map((columnName, idx) => {
                    const columnNames = columnName.displayName.split(" ");
                    const columnNamesWithLineBreaks = columnNames.map((name) => (
                        <React.Fragment key={name}>
                            {name}
                            <br />
                        </React.Fragment>
                    ));
                    return (
                        <th
                            key={`${columnName.name}${idx}`}
                            style={{ margin: "auto", cursor: "pointer" }}
                            className={styles["dataGridth"]}
                            data-column-id={columnName.name}
                            hidden={isColumnHidden(columnName.keyName)}
                        >
                            <div
                                key={`div${columnName}${idx}`}
                                className={`${styles["columndivider"]}`}
                            ></div>
                            <span
                              className={`${styles["material-symbols-outlined"]} material-symbols-outlined`}
                              onClick={() => handleSort(columnName.keyName)}
                              style={{
                                margin: "auto",
                                display: "inline-block",
                                cursor: "pointer",
                              }}
                            >
                              {!sortState ? "expand_more" : "expand_less"}
                            </span>
                            {columnNamesWithLineBreaks}
                        </th>
                    );
                }),
                ...data
                    .filter((row) => !isRowEmpty(row))
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((row, rowIndex: number) => (
                        <tr key={rowIndex} className={styles["gridjs-tr"]}>
                            {Object.entries(row).map(([key, value], index: number) => (
                                <td
                                    key={`${key}_${rowIndex}_${index}`}
                                    className={styles["dataGridtd"]}
                                    data-column-id={key}
                                    hidden={isColumnHidden(key)}
                                >
                                    {value}
                                </td>
                            ))}
                        </tr>
                    )),
            ];

            if (tableRows.length > 0) {
                return (
                    <table id={"gridjs_0"} className={styles["dataGridtable"]}>
                        <thead>
                            <tr>{tableRows[0]}</tr>
                        </thead>
                        <tbody>{tableRows.slice(1)}</tbody>
                    </table>
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
                            onPageChange={handlePageChange} />
                    </div>
                </>
            </React.Fragment>
        );
    }

    function isRowEmpty<T>(row: T): boolean {
        if (!row)
            return true;
        return Object.values(row).every(
            (value) => value === null ||
                value === "" ||
                value === "0" ||
                value === "-1" ||
                value === "0.000000" ||
                value === "NULL"
        );
    }

    function isColumnHidden(columnName: string): boolean {
        if (Array.isArray(data)) {
            const columnData = data.map((row) => row[columnName]);
            return columnData.every(
                (value) => value === null ||
                    value === "" ||
                    value === "0" ||
                    value === "-1" ||
                    value === "0.000000" ||
                    value === "NULL"
            );
        } else {
            return true;
        }
    }
}

export default PropOptionsPage;

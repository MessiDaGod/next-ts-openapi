import React, {useEffect} from 'react';
// import ReactDOM from "react-dom";
import {QueryClient, QueryClientProvider, useQuery} from 'react-query';
import {ReactQueryDevtools} from 'react-query/devtools';
import axios from 'axios';
import {DataSet} from './api/DataObject';
import styles from '../styles/yardiInterface.module.scss';
import {dataGridResize} from './api/dataGridResize';
import {isColumnHidden, parseValue} from './utils';
import {Pagination} from 'pages/pagination';
// import PropertyDropdown from "./propertyDropdown";

const queryClient = new QueryClient();

// type DropdownProps = {
//   data?: {
//     Id: number;
//     Property_Code: string;
//     Property_Name: string;
//     Type: string;
//     StringValue: string;
//     HandleValue: string;
//     HandleValueInt: number | null;
//     Date: string | null;
//   }[];
// };



export default function App() {
  return (
      <Dimensions />
  );
}

function getGoodColumns(): Promise<string[]> {
  return fetch('/GoodColumns.json')
    .then((response) => response.json())
    .then((data) => data.map((item: any) => item.Name));
}

function getDimensions<T>(): Promise<T[]> {
  return fetch('/GoodColumns.json')
    .then((response) => response.json())
    .then((data) => data.map((item: any) => item.Name));
}

export function Dimensions<T>() {
  const [data, setData] = React.useState<T[]>([]);
  const [size, setSize] = React.useState<Boolean>(false);
  const [sortState, setSortState] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);
  const itemsPerPage = 25;

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }


  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await getDimensions();
        const items = JSON.parse(JSON.stringify(response));
        setData(items);
      } catch (error) {
        return [];
      }
    }
    fetchData();
  }, []);



  function handleMouseEnter(e) {
    dataGridResize(itemsPerPage);
  }

  function GenerateDynamicData<T>(data?: T[]): DataSet[] {
    if (!data) data = [];

    const myDataSet: DataSet[] = [];

    // const goodColumns = getGoodColumns();
    if (data.length === 0) return myDataSet;
    for (let i = 0; i < data.length; i++) {
      const values = Object.entries(data);
      values.map((value, idx: number) => {
        myDataSet.push({
          row: i,
          columnName: value[0],
          columnIndex: idx,
          value: value[1] as string,
          columnCount: values.length,
          rowCount: !data ? 0 : data.length,
        });
      });
    }

    return myDataSet;
  }

  function handleSort(columnName: string) {
    let state = sortState;
    if (Array.isArray(data)) {
      const sortedData = [...data].sort((a, b) => {
        //@ts-ignore
        const aValue = a[columnName];
        //@ts-ignore
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

      //@ts-ignore
      setData(sortedData);
      setSortState(!state);
      setCurrentPage(1);
    }
  }


  function GenerateTableHtml() {
    if (Array.isArray(data) && data.length > 0) {
      const gridItems = GenerateDynamicData(data);
      if (!gridItems) return;

      const tableRows = [
        Object.keys(gridItems[0].value).map((item, idx) => {
          const columnNames = item.replaceAll('_', ' ').split(' ');
          const columnNamesWithLineBreaks = columnNames
            .map((name, index: number) => (
              <div
                id={`${name}${idx}${index}`}
                key={`${name}${idx}${index}`}
                className={styles['th']}
                style={{width: '100px'}}
                data-column-id={item}
                hidden={isColumnHidden(data, item)}>
                {name}{' '}
                <span
                  className={'material-symbols-outlined'}
                  onClick={() => handleSort(item)}
                  style={{
                    color: 'black',
                    background: 'transparent',
                  }}>
                  {!sortState ? 'expand_more' : 'expand_less'}
                </span>
                <div
                  key={`${name}${idx}`}
                  className={styles['coldivider']}
                  onMouseEnter={handleMouseEnter}></div>
              </div>
            ))

          return <div key={`${idx}`}>{columnNamesWithLineBreaks}</div>;
        }),
        ...data
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((_row, rowIndex: number) => (
            <div key={`${rowIndex}`} className={styles['tr']}>
              {Object.entries(_row)
                .map(([key, value], index: number) => (
                  <div
                    key={`${key}_${rowIndex}_${index}`}
                    className={styles['td']}
                    data-column-id={key}
                    style={{width: '100px'}}
                    hidden={isColumnHidden(data, key)}>
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
            <div id="gridjs_0" className={styles['divTable']}>
              <div className={styles['thead']}>
                {
                  <input
                    id="search-input"
                    type="search"
                    className={styles['rz-textbox findcomponent']}
                    placeholder="Search ..."
                    autoComplete="on"
                    style={{
                      color: 'white',
                      backgroundColor: 'inherit',
                      fontSize: '14px',
                      borderBottom: '1px solid #2f333d',
                      borderTop: '1px solid #2f333d',
                      cursor: 'text',
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                    }}></input>
                }
                <div className={styles['tr']}>{tableRows[0]}</div>
              </div>
              <div className={styles['tbody']}>
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

  return (
    <>
      <h1>Dimensions</h1>
      <p>Count: {Array.from(new Set(data)).length}</p>
      <>{table}</>

    </>
  );
}

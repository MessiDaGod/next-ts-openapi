import { useState, useMemo } from "react";
import { emptyVendor } from "./api/Objects/Vendor";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
import { DataTable, GetDataDictionary } from "./api/DataObject";

const data = emptyVendor;
const defaultData = Array(2).fill(data);
const options = {};
function ReactTable<T>() {
  const [data, setData] = useState(() => [...defaultData]);
  const [columns, setColumns] = useState(() => []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedData = useMemo(() => GenerateDynamicData(data), [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })


  function GenerateDynamicData(data: T | T[]): DataTable<T> | undefined {
    if (!data) return;
    const json = JSON.stringify(data);
    const dataSet: T[] = JSON.parse(json).map((vendor: T) => ({
      ...vendor,
    }));

    if (dataSet.length > 0) {
      const newItems = GetDataDictionary(dataSet);
      console.log("generating dynamic data...");
      return newItems;
    }
  }

  // ...render your table
}

export default ReactTable;

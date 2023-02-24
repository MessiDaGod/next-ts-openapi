/**
 * Generic interface representing an object with an ID, name, and associated data of type T.
 */
interface BaseDataObject<T> {
  id: number;
  name: string;
  data: T;
}

/**
 * Generic interface representing a column of data for type T. Includes a key, name, and display name.
 */
interface Column<T> {
  key: number;
  name: keyof T;
  keyName: string;
  displayName: string;
}

/**
 * Interface representing a mapping between column keys and arrays of values.
 */
interface Values {
  [key: string]: { Values: any[] };
}

/**
 * A type representing a DataObject of type T with associated columns.
 */
export type DataTable<T> = BaseDataObject<T> & {
  columns: Column<T>[];
  values: Values;
};

/**
 * A type representing a DataObject of type T with associated columns and a mapping of values to columns.
 */
// export type DataObjectWithColumnsAndValues<T> = DataObjectWithColumns<T> & {
//   values: Values;
// };

let idCounter = 0;
/**
 * Generates a default DataObjectWithColumnsAndValues of type T using a list of property names for columns.
 * @param properties - An array of property names to use for columns.
 * @returns A DataObjectWithColumnsAndValues object of type T with default values for columns and values.
 */
export function GenerateDefaultColumns<T>(
  properties: (keyof T)[]
): DataTable<T> {

  const defaultColumns: Column<T>[] = properties.map((prop, idx) => ({
    key: idx,
    name: prop,
    keyName: prop.toString(),
    displayName: prop
    .toString()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
  }));

  const values: Values = {};
  defaultColumns.forEach((column) => {
    values[column.name as string] = { Values: [] };
  });

  return {
    id: idCounter++,
    name: "",
    data: {} as T,
    columns: defaultColumns,
    values: values,
  };
}

export function GetDataDictionary<T>(data: T[]): DataTable<T> {
    if (data === undefined) throw new Error("Data is undefined");
    const properties = Object.keys(data[0] as {}) as (keyof T)[];
    const defaultObject = GenerateDefaultColumns(properties);

    data.forEach((item) => {
      properties.forEach((property) => {
        defaultObject.values[property as string].Values.push(item[property]);
      });
    });

    return defaultObject;
  }

  export interface DataSet {
    [key: number]: number;
    row: number | undefined;
    columnName: string;
    columnIndex: number;
    value: string;
    columnCount: number;
    rowCount: number;
  }

/////////// Example /////////////

// create a function that exports a Vendor[] object using getVendors();
// export const Vendors = async (): Promise<[Vendor]> => {
//   const vendors = await getVendors();
//   return vendors;
// }

// Create an array of Vendor objects
// export const vendors = async (): Promise<Vendor | Vendor[] | null> => [
//   await getVendors();
// ];

// /**
//  * An example of using generateDefaultDataObjectWithColumnsAndValues to create a DataObjectWithColumnsAndValues of type Vendor.
//  */


// const DataObjectWithColumnsAndValues: DataObjectWithColumnsAndValues<Vendor> =
//   generateDefaultDataObjectWithColumnsAndValues<Vendor>(
//     Object.keys(myVendor[0]) as (keyof Vendor)[]
//   );

// // Loop through each Vendor object and populate the values
// myVendor.forEach((vendor) => {
//   Object.entries(vendor).forEach(([key, value]) => {
//     DataObjectWithColumnsAndValues.values[key].Values.push(value);
//   });
// });

// // The DataObjectWithColumnsAndValues object now includes the columns, keys, and values for all the properties in the Vendor objects
// const columnName = DataObjectWithColumnsAndValues.columns[1].name;
// const columnValues = DataObjectWithColumnsAndValues.values[columnName].Values;
// const value = columnValues[0];
// console.log(value);

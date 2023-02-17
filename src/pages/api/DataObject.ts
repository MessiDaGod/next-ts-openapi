/**
 * Generic interface representing an object with an ID, name, and associated data of type T.
 */
interface DataObject<T> {
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
type DataObjectWithColumns<T> = DataObject<T> & {
  columns: Column<T>[];
};

/**
 * A type representing a DataObject of type T with associated columns and a mapping of values to columns.
 */
type DataObjectWithColumnsAndValues<T> = DataObjectWithColumns<T> & {
  values: Values;
};

/**
 * Generates a default DataObjectWithColumnsAndValues of type T using a list of property names for columns.
 * @param properties - An array of property names to use for columns.
 * @returns A DataObjectWithColumnsAndValues object of type T with default values for columns and values.
 */
export function generateDefaultDataObjectWithColumnsAndValues<T>(
  properties: (keyof T)[]
): DataObjectWithColumnsAndValues<T> {
  const defaultColumns: Column<T>[] = properties.map((prop, idx) => ({
    key: idx,
    name: prop,
    displayName: prop.toString(),
  }));
  const values: Values = {};
  defaultColumns.forEach((column) => {
    values[column.name as string] = { Values: [] };
  });

  return {
    id: 0,
    name: "",
    data: {} as T,
    columns: defaultColumns,
    values,
  };
}

type Vendor = {
  Id: number;
  VendorName: string;
  Address: string;
};

export function createDataObjectWithColumnsAndValues<T>(data: T[]): DataObjectWithColumnsAndValues<T> {
    if (data === undefined) throw new Error("Data is undefined");
    const properties = Object.keys(data[0] as {}) as (keyof T)[];
    const defaultObject = generateDefaultDataObjectWithColumnsAndValues(properties);

    data.forEach((item) => {
      properties.forEach((property) => {
        defaultObject.values[property as string].Values.push(item[property]);
      });
    });

    return defaultObject;
  }



/////////// Example /////////////

// Create an array of Vendor objects
const myVendor: Vendor[] = [
  {
    Id: 1,
    VendorName: "Vendor 1",
    Address: "123 Main St",
  },
  {
    Id: 2,
    VendorName: "Vendor 2",
    Address: "456 Oak St",
  },
];

/**
 * An example of using generateDefaultDataObjectWithColumnsAndValues to create a DataObjectWithColumnsAndValues of type Vendor.
 */

// Generate the default DataObjectWithColumnsAndValues object
export const DataObjectWithColumnsAndValues: DataObjectWithColumnsAndValues<Vendor> =
  generateDefaultDataObjectWithColumnsAndValues<Vendor>(
    Object.keys(myVendor[0]) as (keyof Vendor)[]
  );

// Loop through each Vendor object and populate the values
myVendor.forEach((vendor) => {
  Object.entries(vendor).forEach(([key, value]) => {
    DataObjectWithColumnsAndValues.values[key].Values.push(value);
  });
});

// The DataObjectWithColumnsAndValues object now includes the columns, keys, and values for all the properties in the Vendor objects
const columnName = DataObjectWithColumnsAndValues.columns[1].name;
const columnValues = DataObjectWithColumnsAndValues.values[columnName].Values;
const value = columnValues[0];
console.log(value);

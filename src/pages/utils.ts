export function isRowEmpty<T>(row: T): boolean {
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

export function isColumnHidden<T>(data: T[], columnName: string): boolean {
  if (Array.isArray(data)) {
    if (columnName.toLowerCase() === "account" || columnName.toLowerCase() === "person") return false;
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

export function parseValue(value: string, columnName: string): string {
  if (
    !columnName.toLowerCase().includes("date") &&
    !columnName.toLowerCase().includes("post") &&
    !columnName.toLowerCase().includes("month")
  )
    return value;
  if (isNaN(Date.parse(value))) return value;
  else {
    const actualDate = new Date(value);
    if (
      actualDate.getHours() === 0 &&
      actualDate.getMinutes() === 0 &&
      actualDate.getSeconds() === 0
    ) {
      const formattedDate = `${
        actualDate.getMonth() + 1
      }/${actualDate.getDate()}/${actualDate.getFullYear()}`;
      return formattedDate;
    } else {
      return value;
    }
  }
}

export interface ColumnWidths {
  [columnId: string]: number;
}

export interface IconWidths {
  [columnId: string]: number;
}

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

export async function GetDimensions(take: number | null = null) {
  try {
    let url = `https://localhost:5006/api/data/GetDimensions${
      take ? `?take=${encodeURIComponent(take)}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
    });
    const result = await response.text();
    return JSON.parse(result);
  } catch (error) {
    return error;
  }
}

export async function getFromQuery(table: string, take: number) {
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
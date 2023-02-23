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

// function isColumnHidden(columnName: string): boolean {
//   if (Array.isArray(data)) {
//       const columnData = data.map((row) => row[columnName]);
//       return columnData.every(
//           (value) => value === null ||
//               value === "" ||
//               value === "0" ||
//               value === "-1" ||
//               value === "0.000000" ||
//               value === "NULL" ||
//               value === 0
//       );
//   } else {
//       return true;
//   }
// }

export function parseValue(value: string, columnName: string): string {
    if (!columnName.toLowerCase().includes("date") && !columnName.toLowerCase().includes("post")) return value;
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

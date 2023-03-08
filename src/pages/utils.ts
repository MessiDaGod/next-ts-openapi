export interface IconWidths {
  [columnId: string]: number;
}
export interface ColumnWidths {
  [columnId: string]: number;
}

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
    if (
      columnName.toLowerCase() === "account" ||
      columnName.toLowerCase() === "person"
    )
      return false;
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


export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
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

export function Log(message: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(message);
  }
}

export function headerize(text) {
  const wordsToCapitalize = ["date", "num", "post", "month", "tran", "type"];
  let result = text.toLowerCase();
  for (const word of wordsToCapitalize) {
    const regex = new RegExp(`${word}\\w*`, "gi");
    result = result.replace(regex, (match) => {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function paddingDiffY(col: HTMLElement): number {
  if (getStyleVal(col, "box-sizing") === "border-box") {
    return 0;
  }
  const padTop = getStyleVal(col, "padding-top");
  const padBottom = getStyleVal(col, "padding-bottom");
  return parseInt(padTop) + parseInt(padBottom);
}

export function paddingDiff(col: HTMLElement): number {
  if (getStyleVal(col, "box-sizing") === "border-box") {
    return 0;
  }
  const padLeft = getStyleVal(col, "padding-left");
  const padRight = getStyleVal(col, "padding-right");
  return parseInt(padLeft) + parseInt(padRight);
}

export function getStyleVal(elm: HTMLElement, css: string): string {
  return window.getComputedStyle(elm, null).getPropertyValue(css);
}

export function getDataColumnId(selectItem: string): string | null {
  switch (selectItem) {
    case "GetVendors":
      return "Person".toUpperCase();
    case "GetPropOptions":
      return "Property".toUpperCase();
    case "GetAccounts":
      return "Account".toUpperCase();
    default:
      return null;
  }
}

export function setColumnWidths(table: HTMLElement | null) {
  if (!table) return;

  const columnWidths: ColumnWidths = {};

  // const allRows = [...table.querySelectorAll('[class*="' + "tr" + '"]')];

  function visualLength(s: string) {
    const ruler = document.createElement("div");
    (ruler as HTMLElement).style.boxSizing = `border-box`;
    ruler.style.display = "block";
    ruler.style.visibility = "hidden";
    ruler.style.position = "absolute";
    ruler.style.whiteSpace = "nowrap";
    ruler.innerText = s;
    document.body.appendChild(ruler);
    const padding = paddingDiff(ruler as HTMLElement);
    const width = ruler.offsetWidth + padding;
    document.body.removeChild(ruler);
    return width;
  }

  // allRows.forEach((row, rowNumber: number) => {
  const ths = table.querySelectorAll('[class*="' + "_th" + '"]');
  const tds = table.querySelectorAll('[class*="' + "_td" + '"]');
  const cells = [...ths, ...tds];

  cells.forEach((cell) => {
    const columnId = cell.getAttribute("data-column-id");
    if (columnId && cell.getAttribute("hidden") === null) {
      var cellCopy = cell.cloneNode(true) as HTMLElement;
      let iconsToRemove = cellCopy.querySelectorAll("span");
      for (let i = 0; i < iconsToRemove.length; i++) {
        iconsToRemove[i].remove();
      }
      var spanWidths = 0;
      const icons = cell.querySelectorAll("span");
      if (icons && icons.length > 0) {
        for (let i = 0; i < icons.length; i++) {
          const icon = icons[i] as HTMLElement;
          spanWidths += icon.offsetWidth;
        }
      }

      const input = cell.querySelector("input");
      const inputWidth = input ? visualLength(input.value || "") ?? 0 : 0;
      let cellWidth = input
        ? inputWidth + spanWidths
        : (visualLength(cellCopy.textContent || "") ?? 0) + spanWidths;

      // input &&
      //   Log(
      //     `rowNumber: ${rowNumber}, columnId ${columnId} inputWidth: ${inputWidth} input.value: ${
      //       input.value
      //     } iconWidth: ${spanWidths}, ${inputWidth} + ${spanWidths} = ${
      //       inputWidth + spanWidths
      //     }`
      //   );

      // !input &&
      //   Log(
      //     `rowNumber: ${rowNumber}, columnId ${columnId} cellWidth + spanWidths: ${cellWidth} + ${spanWidths} = ${
      //       cellWidth + spanWidths
      //     }`
      //   );

      const existingWidth = columnWidths[columnId];
      if (cellWidth > (existingWidth || 0)) {
        columnWidths[columnId] = cellWidth;
      }
    }
  });
  // });

  Object.entries(columnWidths).map((width) => {
    const [key, value] = width;
    const cols = table.querySelectorAll(`[data-column-id="${key}"]`);
    cols.forEach((col) => {
      if (col) {
        (col as HTMLElement).style.width = `auto`;
        // (col as HTMLElement).style.boxSizing = `border-box`;
        (col as HTMLElement).style.display = "inline-block";
        (col as HTMLElement).style.whiteSpace = "nowrap";
        (col as HTMLElement).style.textAlign = "left";
        (col as HTMLElement).style.margin = "1px";
        (col as HTMLElement).style.padding = "1px";
        (col as HTMLElement).style.minHeight = "100%";
        (col as HTMLElement).style.minWidth = `${Math.round(value)}px`;
        (col as HTMLElement).style.width = `${Math.round(value)}px`;
      }
    });
  });

  let tableWidth = 0;
  const columns = table.querySelectorAll('[class*="' + "th" + '"]');
  columns.forEach((col) => {
    tableWidth +=
      parseInt((col as HTMLElement).style.width) +
      paddingDiff(col as HTMLElement);
  });

  // (table as HTMLElement).style.width = tableWidth.toString() + "px";
  // (table as HTMLElement).style.zIndex = zIndex.toString()
  return columnWidths;
}

export function setDropdownGridWidths(dropdownRef: HTMLElement | null) {
  const table = dropdownRef as HTMLElement;
  if (!table) return;

  const columnWidths: ColumnWidths = {};

  // const allRows = [...table.querySelectorAll('[class*="' + "tr" + '"]')];

  function visualLength(s: string) {
    const ruler = document.createElement("div");
    (ruler as HTMLElement).style.boxSizing = `border-box`;
    ruler.style.display = "block";
    ruler.style.visibility = "hidden";
    ruler.style.position = "absolute";
    ruler.style.whiteSpace = "nowrap";
    ruler.innerText = s;
    document.body.appendChild(ruler);
    const padding = paddingDiff(ruler as HTMLElement);
    const width = ruler.offsetWidth + padding;
    document.body.removeChild(ruler);
    return width;
  }

  // allRows.forEach((row, rowNumber: number) => {
  const ths = table.querySelectorAll('[class*="' + "_th" + '"]');
  const tds = table.querySelectorAll('[class*="' + "_td" + '"]');
  const cells = [...ths, ...tds];

  cells.forEach((cell) => {
    const columnId = cell.getAttribute("data-column-id");
    if (columnId && cell.getAttribute("hidden") === null) {
      var cellCopy = cell.cloneNode(true) as HTMLElement;
      let iconsToRemove = cellCopy.querySelectorAll("span");
      for (let i = 0; i < iconsToRemove.length; i++) {
        iconsToRemove[i].remove();
      }
      var spanWidths = 0;
      const icons = cell.querySelectorAll("span");
      if (icons && icons.length > 0) {
        for (let i = 0; i < icons.length; i++) {
          const icon = icons[i] as HTMLElement;
          spanWidths += icon.offsetWidth;
        }
      }

      const input = cell.querySelector("input");
      const inputWidth = input ? visualLength(input.value || "") ?? 0 : 0;
      let cellWidth = input
        ? inputWidth + spanWidths
        : (visualLength(cellCopy.textContent || "") ?? 0) + spanWidths;

      // input &&
      //   Log(
      //     `rowNumber: ${rowNumber}, columnId ${columnId} inputWidth: ${inputWidth} input.value: ${
      //       input.value
      //     } iconWidth: ${spanWidths}, ${inputWidth} + ${spanWidths} = ${
      //       inputWidth + spanWidths
      //     }`
      //   );

      // !input &&
      //   Log(
      //     `rowNumber: ${rowNumber}, columnId ${columnId} cellWidth + spanWidths: ${cellWidth} + ${spanWidths} = ${
      //       cellWidth + spanWidths
      //     }`
      //   );

      const existingWidth = columnWidths[columnId];
      if (cellWidth > (existingWidth || 0)) {
        columnWidths[columnId] = cellWidth;
      }
    }
  });
  // });

  Object.entries(columnWidths).map((width) => {
    const [key, value] = width;
    const cols = table.querySelectorAll(`[data-column-id="${key}"]`);
    cols.forEach((col) => {
      if (col) {
        (col as HTMLElement).style.width = `auto`;
        (col as HTMLElement).style.display = "inline-block";
        (col as HTMLElement).style.whiteSpace = "nowrap";
        (col as HTMLElement).style.textAlign = "left";
        (col as HTMLElement).style.margin = "1px";
        (col as HTMLElement).style.padding = "1px";
        (col as HTMLElement).style.minHeight = "100%";
        (col as HTMLElement).style.zIndex = "0";
        (col as HTMLElement).style.minWidth = `${Math.round(value)}px`;
        (col as HTMLElement).style.width = `${Math.round(value)}px`;
      }
    });
  });

  let tableWidth = 0;
  const columns = table.querySelectorAll('[class*="' + "th" + '"]');
  columns.forEach((col) => {
    tableWidth +=
      parseInt((col as HTMLElement).style.width) +
      paddingDiff(col as HTMLElement);
  });

  // (table as HTMLElement).style.width = tableWidth.toString() + "px";
  // (table as HTMLElement).style.zIndex = zIndex.toString()
  return columnWidths;
}
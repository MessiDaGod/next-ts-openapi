import { openDB, DBSchema } from "idb";
import { Payable } from "./dataStructure";

interface MyDB extends DBSchema {
  dimensions: {
    key: number;
    value: Payable;
  };
  dimension: {
    value: {
      name: string;
      price: number;
      productCode: string;
    };
    key: string;
    indexes: { "by-id": number };
  };
}

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

export function setAllZIndicesToZero() {
  // Get all elements on the page
  const allElements = document.querySelectorAll("*");

  // Loop through each element and set its z-index to 0
  allElements.forEach((element) => {
    (element as HTMLElement).style.zIndex = "0";
  });
}

export function setAllZIndicesTo1000(doc: HTMLElement) {
  if (!doc) return;
  const allElements = doc.querySelectorAll("*");

  // Loop through each element and set its z-index to 0
  allElements.forEach((element, index: number) => {
    (element as HTMLElement).style.zIndex = "1000";
  });
}

export function dataExtractor() {
  console.clear();
  const table = document.querySelectorAll('[id*="' + "gridjs_" + '"]')[0];

  // console.log(table);

  let rows;

  rows = table && table.querySelectorAll("div[data-row-id]");

  rows.forEach((row, index) => {
    const rowId = row.getAttribute("data-row-id");

    const cells = row.querySelectorAll("div[class*=" + "td" + "]");

    console.log(
      `----------------------------${rowId}----------------------------------`
    );
    cells.forEach((cell, cellIndex) => {
      const columnId = cell.getAttribute("data-column-id");
      // console.log(`rowId: ${rowId} columnId: ${columnId} innerText: ${cell.innerText}`);
      const input = cell.querySelector("input") as HTMLInputElement;

      input &&
        console.log(
          `${
            cell.querySelector("input").value
          } rowId: ${rowId} columnId: ${columnId} cellIndex: ${cellIndex + 1}`
        );

      !input &&
        console.log(
          `rowId: ${rowId} columnId: ${columnId} cellIndex: ${
            cellIndex + 1
          } innerText: ${cell.innerText}`
        );
    });
  });
}

export async function getTableData() {
  const table = document.querySelectorAll('[id*="gridjs_"]')[0];

  let rows: any[] | NodeListOf<HTMLElement>;

  rows = table && table.querySelectorAll("div[data-row-id]");

  const tableData = {};

  rows.forEach((row, index) => {
    if (index > 0) {
      const rowId = row.getAttribute("data-row-id");

      const cells = row.querySelectorAll('div[class*="td"]');

      tableData[rowId] = {};

      cells.forEach((cell, cellIndex) => {
        const columnId = cell.getAttribute("data-column-id");
        const input = cell.querySelector("input") as HTMLInputElement;

        if (input) {
          tableData[rowId][columnId] = input.value.trim();
        } else {
          tableData[rowId][columnId] = (cell as HTMLElement).innerText.trim();
        }
      });
    }
  });

  const dimensions = JSON.parse(JSON.stringify(tableData)) as Array<Payable>;
  const payables = [...Array.from(dimensions)];

  const db = await openDB<MyDB>("app-db", 1, {
    upgrade(db) {
      db.createObjectStore("dimensions");

      const dimensionStore = db.createObjectStore("dimension", {
        keyPath: "Id",
      });
      dimensionStore.createIndex("by-id", "Id");
    },
  });

  payables.forEach((dimension) => {
    return db.put("dimensions", dimension, dimension.Id);
  });

  // await db.put('dimensions', dimensions[1], dimensions[1].Id);

  return JSON.parse(JSON.stringify(tableData));
}

export declare module Transactions {
  export interface Payable {
    Id: number;
    TRANNUM: string;
    PERSON: string;
    OFFSET: string;
    ACCRUAL: string;
    POSTMONTH: Date;
    DATE: Date;
    DUEDATE: Date;
    AMOUNT: string;
    PROPERTY: string;
    ACCOUNT: string;
    NOTES: string;
    REF: string;
    CHECKNUM: string;
    DESC: string;
    EXPENSETYPE: string;
    DETAILTAXAMOUNT1: string;
    DETAILTAXAMOUNT2: string;
    DETAILTRANAMOUNT: string;
    DETAILVATTRANTYPEID: string;
    DETAILVATRATEID: string;
    TRANCURRENCYID: string;
    EXCHANGERATE: string;
    EXCHANGERATE2: string;
    AMOUNT2: string;
    DOCUMENTSEQUENCENUMBER: string;
    DISPLAYTYPE: string;
    Company: string;
    FundingEntity: string;
    JOB: string;
    CATEGORY: string;
    CONTRACT: string;
    COSTCODE: string;
    USERDEFINEDFIELD1: string;
    USERDEFINEDFIELD2: string;
    USERDEFINEDFIELD3: string;
    USERDEFINEDFIELD4: string;
    USERDEFINEDFIELD5: string;
    USERDEFINEDFIELD6: string;
    USERDEFINEDFIELD7: string;
    USERDEFINEDFIELD8: string;
    USERDEFINEDFIELD9: string;
    USERDEFINEDFIELD10: string;
    INTERNATIONALPAYMENTTYPE: string;
    WORKFLOW: string;
    WORKFLOWSTATUS: string;
    WORKFLOWSTEP: string;
    DETAILFIELD1: string;
    DETAILFIELD2: string;
    DETAILFIELD3: string;
    DETAILFIELD4: string;
    DETAILFIELD5: string;
    DETAILFIELD6: string;
    DETAILFIELD7: string;
    DETAILFIELD8: string;
    NOTES2: string;
    PONUM: string;
    PODETAILID: string;
    TRANDATE: string;
    RETENTION: string;
    ORIGINALUREF: string;
    CREDITMEMO: string;
    ADJUSTMENT: string;
    Labour: string;
    Material: string;
    CITBLevy: string;
    ManufacturingCosts: string;
    Travel: string;
    NonCisLabor: string;
  }
}

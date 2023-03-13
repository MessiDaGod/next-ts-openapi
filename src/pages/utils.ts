import { openDB, DBSchema } from "idb";
import axios from "axios";
import fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, once, stdout as output } from "node:process";
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
    key: number;
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

export function setAllZIndicesToZero(elem: HTMLElement) {
  // Get all elements on the page
  const allElements = elem.querySelectorAll("*");

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


export async function upsertTableData() {
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

  const dimensions = Object.values(tableData) as Array<Payable>;

  const db = await openDB<MyDB>("app-db", 1, {
    upgrade(db) {
      db.createObjectStore("dimensions");

      const dimensionStore = db.createObjectStore("dimension", {
        keyPath: "Id",
      });
      dimensionStore.createIndex("by-id", "Id");
    },
  });

  dimensions.forEach((dimension) => {
    return db.put("dimensions", dimension, dimension.Id);
  });

  const result = await putDimensions(JSON.stringify(tableData));

  return result;
}

export async function exportCsv() {
  const table = document.querySelectorAll('[id*="gridjs_"]')[0];
  const headers = Array.from(table.querySelectorAll('[data-column-id]')).map(cell => cell.getAttribute('data-column-id'));
  const uniqueHeaders = [...new Set(headers)];
  const rowsData = [uniqueHeaders];
  let rows: any[] | NodeListOf<HTMLElement>;

  rows = table && table.querySelectorAll("div[data-row-id]");
  rows.forEach((row, index) => {
    if (index > 0) {
      // const rowId = row.getAttribute("data-row-id");

      const cells = row.querySelectorAll('div[class*="td"]');

      const rowData = [];

      cells.forEach((cell) => {
        // const columnId = cell.getAttribute("data-column-id");
        const input = cell.querySelector("input") as HTMLInputElement;

        if (input) {
          rowData.push(input.value.trim());
        } else {
          rowData.push((cell as HTMLElement).innerText.trim());
        }
      });
      rowsData.push(rowData);
    }
  });

  const csvData = rowsData.map((row) => row.join(",")).join("\n");

  // fs.writeFileSync("table-data.csv", csvData);

  const csvBlob = new Blob([csvData], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = csvUrl;
  downloadLink.download = "table-data.csv";
  downloadLink.style.display = "none";

  document.body.appendChild(downloadLink);

  downloadLink.click();

  document.body.removeChild(downloadLink);

}

async function putDimensions(dimension: string | null = null) {
  const jsonObject = JSON.parse(dimension);
  for (const key in jsonObject) {
    delete jsonObject[key].Id;
  }
  const parsedJson = Object.values(JSON.parse(JSON.stringify(jsonObject)));
  Log(JSON.stringify(parsedJson));
  try {
    let url = `https://localhost:5006/api/data/PutDimensions${
      parsedJson
        ? `?value=${encodeURIComponent(JSON.stringify(parsedJson))}`
        : ""
    }`;
    axios.post(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const listElem = (
      document.getElementById("notifications-popup") as HTMLElement
    ).querySelector("ul") as HTMLElement;
    const children = listElem.children;
    if (children[0].textContent.includes(":(")) listElem.innerHTML = "";
    const li = document.createElement("li");
    li.innerHTML = "Dimensions added successfully!";
    listElem.appendChild(li);
  } catch (error) {
    return error.message;
  }
}



export function getSelectItem(key: string) {
  switch (key) {
    case "PROPERTY":
      return "GetPropOptions";
    case "ACCOUNT":
      return "GetAccounts";
    case "PERSON":
      return "GetVendors";
    default:
      return "Property";
  }
}

export function getSelectKey(key: string) {
  switch (key) {
    case "PROPERTY":
      return "Property";
    case "ACCOUNT":
      return "Account";
    case "PERSON":
      return "Vendor";
    default:
      return "Property";
  }
}

import cn from "classnames";

interface ColumnWidths {
  [columnId: string]: number;
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

function getStyleVal(elm: HTMLElement, css: string): string {
  return window.getComputedStyle(elm, null).getPropertyValue(css);
}

export function setColumnWidths(tableId: string): ColumnWidths {
  const tables = [...document.querySelectorAll('[id*="' + tableId + '"]')];
  const table = tables[0];
  if (!table) {
    return {};
  }

  const columnWidths: ColumnWidths = {};

  const allRows = [...tables[0].querySelectorAll('[class*="' + "tr" + '"]')];

  function visualLength(s: string) {
    const ruler = document.createElement("div");
    (ruler as HTMLElement).style.boxSizing = `content-box`;
    ruler.style.display = "block";
    ruler.style.visibility = "hidden";
    ruler.style.position = "absolute";
    ruler.style.whiteSpace = "nowrap";
    ruler.style.padding = "0.25rem";
    ruler.innerText = s;
    document.body.appendChild(ruler);
    const padding = paddingDiff(ruler as HTMLElement);
    const width = Math.round(ruler.getBoundingClientRect().width + padding);
    document.body.removeChild(ruler);
    return width;
  }

  allRows.forEach((row) => {
    const ths = row.querySelectorAll('[class*="' + "th" + '"]');
    const tds = row.querySelectorAll('[class*="' + "td" + '"]');
    const cells = [...ths, ...tds];

    cells.forEach((cell) => {
      const columnId = cell.getAttribute("data-column-id");
      if (columnId && cell.getAttribute("hidden") === null) {
        var cellCopy = cell.cloneNode(true) as HTMLElement;
        var spanWidths = 0;
        const icons = cell.querySelectorAll("span");
        if (icons && icons.length > 0) {
          for (let i = 0; i < icons.length; i++) {
            const icon = icons[i] as HTMLElement;
            spanWidths += icon.offsetWidth;
          }
        }
        let iconsToRemove = cellCopy.querySelectorAll("span");
        for (let i = 0; i < iconsToRemove.length; i++) {
          iconsToRemove[i].remove();
        }
        let cellWidth = visualLength(cellCopy.textContent || "");
        cellWidth += spanWidths;
        spanWidths = 0;
        const existingWidth = columnWidths[columnId];
        if (cellWidth > (existingWidth || 0)) {
          columnWidths[columnId] = cellWidth;
        }
      }
    });
  });


  Object.entries(columnWidths).map((width) => {
    const [key, value] = width;
    const cols = table.querySelectorAll(`[data-column-id="${key}"]`);
    cols.forEach((col) => {
      if (col) {
        (col as HTMLElement).style.width = `auto`;
        (col as HTMLElement).style.display = "inline-block";
        (col as HTMLElement).style.whiteSpace = "nowrap";
        (col as HTMLElement).style.textAlign = "left";
        (col as HTMLElement).style.padding = "0px";
        (col as HTMLElement).style.minHeight = "0px";
        (col as HTMLElement).style.minWidth = `${value}px`;
        (col as HTMLElement).style.width = `${value}px`;
      }
    });
  });

  let tableWidth = 0;
  const columns = table.querySelectorAll('[class*="' + "th" + '"]');
  columns.forEach((col) => {
    tableWidth += parseInt((col as HTMLElement).style.width) + paddingDiff(col as HTMLElement);
  });

  (table as HTMLElement).style.width = tableWidth.toString() + "px";
  (table as HTMLElement).style.border = "2px solid red";

  console.log(document.querySelectorAll(`[class*="${cn("dropdown")}"]`));
  return columnWidths;
}

function setListeners(div: HTMLDivElement, itemsPerPage?: number): void {
  if (div.parentElement?.getAttribute("hidden") !== null) return;
  var pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    prevCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined,
    prevColWidth: number | undefined;

  if (div.parentElement) {
    div.addEventListener("dblclick", function (e: MouseEvent): void {
      setColumnWidths("gridjs_");
    });

    div.addEventListener(
      "mousedown",
      function (e: MouseEvent): void {
        var target = e.target as HTMLElement;
        curCol = target ? target.parentElement : null;
        var nextCol = curCol
          ? (curCol.nextElementSibling as HTMLElement)
          : null;
        nextCol = nextCol ? (nextCol?.nextElementSibling as HTMLElement) : null;
        if (curCol)
          prevCol = curCol
            ? (curCol.previousElementSibling as HTMLElement)
            : null;
        pageX = e.pageX;

        const padding = curCol ? paddingDiff(curCol) : 0;

        curColWidth =
          curCol && curCol.offsetWidth > 0 && curCol.offsetWidth > padding
            ? curCol.offsetWidth - padding
            : 0;
        if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;

        if (prevCol) prevColWidth = prevCol.offsetWidth - padding;
      },
      { passive: true }
    );

    document.addEventListener(
      "mousemove",
      function (e: MouseEvent): void {
        const diffX = e.pageX - (pageX ?? 0);
        const tables = [
          ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
        ];
        if (curCol) {
          curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
          curCol.style.width = (curColWidth ?? 0) + diffX + "px";

          if (tables[0]) {
            let allCells = Array.from(
              new Set([
                ...tables[0].querySelectorAll(
                  '[data-column-id="' + curCol.dataset.columnId + '"]'
                ),
              ])
            );
            if (allCells)
              allCells.forEach((cell) => {
                (cell as HTMLElement).style.minWidth =
                  (curColWidth ?? 0) + diffX + "px";
                (cell as HTMLElement).style.width =
                  (curColWidth ?? 0) + diffX + "px";
              });
          }
        }

        if (nxtCol) {
          nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
          nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";

          if (tables[0]) {
            let allCells = Array.from(
              new Set([
                ...tables[0].querySelectorAll(
                  '[data-column-id="' + nxtCol.dataset.columnId + '"]'
                ),
              ])
            );
            if (allCells)
              allCells.forEach((cell) => {
                (cell as HTMLElement).style.minWidth =
                  (nxtColWidth ?? 0) + diffX + "px";
                (cell as HTMLElement).style.width =
                  (nxtColWidth ?? 0) + diffX + "px";
              });
          }
        }
      },
      { passive: true, once: false }
    );

    document.addEventListener("mouseup", function (e: MouseEvent): void {
      curCol = null;
      nxtCol = null;
      pageX = undefined;
      nxtColWidth = undefined;
      curColWidth = undefined;
    });
  }
}

export function dataGridResize(itemsPerPage?: number) {
  initResizeListeners();
  let resizeDivs = Array.from(
    new Set([
      ...document.querySelectorAll('div[class*="' + "coldivider" + '"]'),
    ])
  );
  if (resizeDivs && resizeDivs.length > 0) {
    for (let i = 0; i < resizeDivs.length; i++) {
      setListeners(resizeDivs[i] as HTMLDivElement, itemsPerPage);
    }
  }

  function initResizeListeners() {
    if (!document) return;
    const tables = [...document.querySelectorAll('[id^="' + "gridjs_" + '"]')];
    for (let i = 0; i < tables.length; i++) {
      const columns = Array.from(
        new Set([...tables[i].querySelectorAll("th")])
      );
      columns.forEach((th) => {
        th.style.width = th.getBoundingClientRect().width + "px";
        th.style.minWidth = th.getBoundingClientRect().width + "px";
      });
      resizableGrid(tables[i] as HTMLTableElement);
    }

    function resizableGrid(table: HTMLTableElement) {
      const rows = Array.from(
        table.getElementsByTagName('div[class*="' + "tr" + '"]')
      );
      const cells = Array.from(
        table.getElementsByTagName('div[class*="' + "td" + '"]')
      );

      cells.forEach((cell) => {
        setCellListeners(cell as HTMLElement);
      });

      rows.forEach((tr) => {
        setRowListeners(tr as HTMLElement);
      });

      function setCellListeners(cell: HTMLElement) {
        if (cell.dataset.columnId === "Row")
          cell.addEventListener("mouseover", function (_e) {
            this.classList.add("cellhoverover");
          });

        cell.addEventListener("mouseout", function (_e) {
          this.classList.remove("cellhoverover");
        });
      }

      function setRowListeners(row: HTMLElement) {
        row.addEventListener("mouseover", function (_e) {
          this.classList.add("hoverover");
        });

        row.addEventListener("mouseout", function (_e) {
          this.classList.remove("hoverover");
        });
      }
    }
  }
}

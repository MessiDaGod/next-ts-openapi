function setListeners(div: HTMLDivElement): void {
  if (div.parentElement.getAttribute("hidden") === null)
    if (div.parentElement.getAttribute("hidden") !== null) return;
  let pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    prevCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined,
    prevColWidth: number | undefined;
  div.addEventListener(
    "mousedown",
    function (e: MouseEvent): void {
      e.preventDefault();
      console.log("mousedown listener called...");
      const target = e.target as HTMLElement;
      curCol = target ? target.parentElement : null;
      var nextCol = curCol ? (curCol.nextElementSibling as HTMLElement) : null;
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
    { once: false, passive: false }
  );
  div.addEventListener(
    "mousemove",
    function (e: MouseEvent): void {
      e.preventDefault();
      console.log("mousemove listener called...");
      const diffX = e.pageX - (pageX ?? 0);
      const tables = [
        ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
      ];

      if (curCol) {
        const allCells = Array.from(
          new Set([
            ...tables[0].querySelectorAll(
              '[data-column-id="' + curCol.dataset.columnId + '"]'
            ),
          ])
        );
        curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
        curCol.style.width = (curColWidth ?? 0) + diffX + "px";

        if (allCells)
          allCells.forEach((cell) => {
            (cell as HTMLElement).style.minWidth =
              (curColWidth ?? 0) + diffX + "px";
            (cell as HTMLElement).style.width =
              (curColWidth ?? 0) + diffX + "px";
          });
      }

      if (nxtCol) {
        nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
        nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";

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
    },
    { once: false, passive: false }
  );

  document.addEventListener(
    "mouseup",
    function (e: MouseEvent): void {
      e.preventDefault();

      console.log("mouseup listener called...");
      curCol = null;
      nxtCol = null;
      pageX = undefined;
      nxtColWidth = undefined;
      curColWidth = undefined;
    },
    { once: false, passive: false }
  );
}

function paddingDiff(col: HTMLElement): number {
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

export function dataGridResize(itemsPerPage?: number) {
  initResizeListeners();
  let resizeDivs = Array.from(
    new Set([
      ...document.querySelectorAll('div[class*="' + "coldivider" + '"]'),
    ])
  );
  if (resizeDivs && resizeDivs.length > 0) {
    for (let i = 0; i < resizeDivs.length; i++) {
      setListeners(resizeDivs[i] as HTMLDivElement);
    }
  }
}
function initResizeListeners() {
  if (!document) return;
  const tables = [...document.querySelectorAll('[id^="' + "gridjs_" + '"]')];
  for (let i = 0; i < tables.length; i++) {
    const columns = Array.from(new Set([...tables[i].querySelectorAll("th")]));
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

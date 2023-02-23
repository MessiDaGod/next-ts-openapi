function setListeners(div: HTMLElement): void {
  var pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    prevCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined,
    prevColWidth: number | undefined;

  if (div.parentElement) {
    div.addEventListener("mouseenter", function (e: MouseEvent): void {
      e.preventDefault();
      let dataColumnId = (e.target as HTMLElement).dataset.columnId;
      let tbl = this.closest("table") as HTMLTableElement;
      if (tbl) {
        let allCells = Array.from(
          new Set([
            ...tbl.querySelectorAll('[data-column-id="' + dataColumnId + '"]'),
          ])
        );
        // if (allCells)
        //   allCells.forEach((cell) => {
        //     (cell as HTMLElement).style.borderRight = "solid #0000ff";
        //     (cell as HTMLElement).style.cursor = "col-resize";
        //   });
      }
    });

    div.parentElement.addEventListener(
      "mouseout",
      function (e: MouseEvent): void {
        e.preventDefault();
        let dataColumnId = (e.target as HTMLElement).dataset.columnId;
        let tbl = this.closest("table") as HTMLTableElement;
        if (tbl) {
          let allCells = Array.from(
            new Set([
              ...tbl.querySelectorAll(
                '[data-column-id="' + dataColumnId + '"]'
              ),
            ])
          );
          if (allCells)
            allCells.forEach((cell) => {
              (cell as HTMLElement).style.borderRight = "";
              (cell as HTMLElement).style.cursor = "";
            });
        }
      }
    );

    div.addEventListener("mousedown", function (e: MouseEvent): void {
      var target = e.target as HTMLElement;
      curCol = target ? target.parentElement : null;

      const tables = [
        ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
      ];
      let allCells = Array.from(
        new Set([
          ...tables[0].querySelectorAll(
            '[data-column-id="' + curCol.dataset.columnId + '"]'
          ),
        ])
      );
      if (allCells)
        allCells.forEach((cell) => {
          (cell as HTMLElement).style.borderRight = "solid #0000ff";
        });
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
    });

    document.addEventListener("mousemove", function (e: MouseEvent): void {
      const diffX = e.pageX - (pageX ?? 0);
      const tables = [
        ...document.querySelectorAll('[id^="' + "gridjs_" + '"]'),
      ];
      if (curCol) {
        curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
        curCol.style.width = (curColWidth ?? 0) + diffX + "px";

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

      // if (prevCol) {
      //   prevCol.style.minWidth = (prevColWidth ?? 0) - diffX + "px";
      //   prevCol.style.width = (prevColWidth ?? 0) - diffX + "px";
      // }
    });

    document.addEventListener("mouseup", function (e: MouseEvent): void {

      curCol = null;
      nxtCol = null;
      pageX = undefined;
      nxtColWidth = undefined;
      curColWidth = undefined;
    });

    div.addEventListener("mouseup", function (e: MouseEvent): void {

      // console.log(curCol);
      const tables = [
        ...document.querySelectorAll('div[id*="' + "gridjs_" + '"]'),
      ];
      let allCells = Array.from(
        new Set([
          ...tables[0].querySelectorAll(
            '[data-column-id="' + curCol.dataset.columnId + '"]'
          ),
        ])
      );
      if (allCells) {
        allCells.forEach((cell) => {
          (cell as HTMLElement).style.borderRight = "";
        });
      }
    });
  }
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

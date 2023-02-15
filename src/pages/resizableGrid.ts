declare global {
  interface String {
    visualLength(): number;
  }
}

String.prototype.visualLength = function () {
  const ruler = document.getElementById("ruler") as HTMLElement;
  if (ruler) {
    ruler.innerHTML = this as string;
    return ruler.offsetWidth;
  }
  return 0;
};

function redoGrid() {
  function $$(id: string) {
    return document.getElementById(id);
  }

  function $$$(id: string) {
    return document.getElementsByClassName(id);
  }

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  var pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    prevCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined,
    prevColWidth: number | undefined;
  ``;

  initResizeListeners();
  const tables = [
    ...document.querySelectorAll('table[id^="' + "gridjs_" + '"]'),
  ];
  tables.forEach((table) => {
    const cells = Array.from(new Set([...table.querySelectorAll("td")]));
    let pay = document.getElementById("payableStatus") as HTMLElement;
    let istatus: number;
    // istatus = !pay.value ? -1 : pay.value;
    istatus =
      pay !== null && pay.textContent ? parseInt(pay.textContent, 10) : -1;

    cells.forEach((cell) => {
      let attr = cell.getAttribute("data-column-id");
      if (attr && attr === "STATUS") {
        let span = cell.querySelector("span");
        if (span && span.classList.length > 0) {
          let status = "";
          switch (istatus) {
            case -1:
              status = "none";
              break;
            case 0:
              status = "fail";
              break;
            case 1:
            case 2:
              status = "success";
              break;
            default:
              status = "none";
              break;
          }
          span.classList.add(status);
        }
      }
    });
  });

  function initResizeListeners() {
    const tables = [
      ...document.querySelectorAll('table[id^="' + "gridjs_" + '"]'),
    ];
    for (let i = 0; i < tables.length; i++) {
      const columns = Array.from(
        new Set([...tables[i].querySelectorAll("th")])
      );
      columns.forEach((th) => {
        th.style.width =
          (th.textContent ? th.textContent.visualLength() + 12 : 0).toString() +
          "px";
      });
      resizableGrid(tables[i] as HTMLTableElement);
    }

    function resizableGrid(table: HTMLTableElement) {
      const row = table.getElementsByTagName("tr")[0];
      var cols = row ? row.children : undefined;
      if (!cols) return;

      // table.style.overflow = 'hidden';

      const tableHeight = table.offsetHeight;

      for (let i = 0; i < cols.length; i++) {
        const div = createDiv(tableHeight);
        cols[i].appendChild(div);
        if (cols[i]) {
          let column = cols[i] as HTMLElement;
          column.style.position = "relative";
          setListeners(div);
        }
      }

      const rows = Array.from(table.getElementsByTagName("tr"));
      const cells = Array.from(table.getElementsByTagName("td"));

      cells.forEach((cell) => {
        setCellListeners(cell);
      });

      rows.forEach((tr) => {
        setRowListeners(tr);
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

      function setListeners(div: HTMLElement): void {
        div.addEventListener("dblclick", function (_e: MouseEvent): void {
          var tbl = this.closest("table") as HTMLTableElement;
          var columns = Array.from(new Set([...tbl.querySelectorAll("th")]));
          columns.forEach((th) => {
            if (th.textContent)
              th.style.width = th.textContent.visualLength() + 13 + "px";
          });
        });

        div.addEventListener("mousedown", function (e: MouseEvent): void {
          var target = e.target as HTMLElement;
          curCol = target ? target.parentElement : null;
          var nextCol = curCol
            ? (curCol.nextElementSibling as HTMLElement)
            : null;
          nextCol = nextCol
            ? (nextCol?.nextElementSibling as HTMLElement)
            : null;
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

        div.addEventListener("mouseover", function (e: MouseEvent): void {
          (e.target as HTMLElement).style.borderRight = "2px solid #0000ff";
        });

        div.addEventListener("mouseout", function (e: MouseEvent): void {
          (e.target as HTMLElement).style.borderRight = "";
        });

        document.addEventListener("mousemove", function (e: MouseEvent): void {
          if (curCol) {
            const diffX = e.pageX - (pageX ?? 0);

            if (nxtCol) {
              nxtCol.style.minWidth = (nxtColWidth ?? 0) - diffX + "px";
              nxtCol.style.width = (nxtColWidth ?? 0) - diffX + "px";
            }
            curCol.style.minWidth = (curColWidth ?? 0) + diffX + "px";
            curCol.style.width = (curColWidth ?? 0) + diffX + "px";
          }
        });

        document.addEventListener("mouseup", function (_e: MouseEvent): void {
          curCol = null;
          nxtCol = null;
          pageX = undefined;
          nxtColWidth = undefined;
          curColWidth = undefined;
        });
      }

      function createDiv(height: number): HTMLDivElement {
        const div = document.createElement("div");
        div.classList.add("columndivider");
        div.style.height = height + "px";
        var badDivs = Array.from(
          new Set([
            ...div.querySelectorAll('div[class^="' + "columndivider" + '"]'),
          ])
        ) as HTMLDivElement[];
        badDivs.forEach((badDiv) => {
          if (badDiv && badDiv.style.height === "0px") badDiv.remove();
        });
        return div;
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
    }
  }
}

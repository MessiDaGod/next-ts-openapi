declare global {
  interface String {
    visualLength(): number;
  }
}

String.prototype.visualLength = function () {
    if (!document) return 0;
    const ruler = document.getElementById("ruler") as HTMLElement;
    if (ruler) {
      ruler.innerHTML = this as string;
      return ruler.offsetWidth;
    }
    return 0;
  };

export const dataGridResize = () => {

  initResizeListeners();
  if (!document) return;
  var tables = Array.from(new Set([...document.querySelectorAll('table[id^="' + "gridjs_" + '"]')]));

  tables.forEach((table) => {
    if (window.location.href.includes("ssms")) {
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
    }
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
    }
  }
};

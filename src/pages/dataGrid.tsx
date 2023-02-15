import * as React from "react";
import styles from "./dataGrid.module.css";
import { dataGridResize } from "./api/dataGridResize";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
// import { useResizeColumns, useTable, UseTableInstanceProps } from "react-table";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: "tanner",
    lastName: "linsley",
    age: 24,
    visits: 100,
    status: "In Relationship",
    progress: 50,
  },
  {
    firstName: "tandy",
    lastName: "miller",
    age: 40,
    visits: 40,
    status: "Single",
    progress: 80,
  },
  {
    firstName: "joe",
    lastName: "dirte",
    age: 45,
    visits: 20,
    status: "Complicated",
    progress: 10,
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("firstName", {
    id: "firstName",
    cell: (info) => info.getValue(),
    header: "First Name",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: "lastName",
    cell: (info) => <i>{info.getValue()}</i>,
    header: "Last Name",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("age", {
    id: "age",
    header: "Age",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("visits", {
    id: "visits",
    header: "Visits",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("progress", {
    id: "progress",
    header: "Profile Progress",
    footer: (info) => info.column.id,
  }),
];


function handleSetData() {
  dataGridResize();
}

function setListeners(div: HTMLElement): void {
  var pageX: number | undefined,
    curCol: HTMLElement | null,
    nxtCol: HTMLElement | null,
    prevCol: HTMLElement | null,
    curColWidth: number | undefined,
    nxtColWidth: number | undefined,
    // @ts-ignore
    prevColWidth: number | undefined;
  ``;
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

export function DataGrid() {
  // @ts-ignore
  const [data, setData] = React.useState(() => [...defaultData]);
  const rerender = React.useReducer(() => ({}), {})[1];
  React.useEffect(() => {
    // This code will run after the component has mounted.
    handleSetData();
  }, []);

  // make the grid column lengths resizable
  // const [headers, setHeaders] = React.useState<{Headers: any}>([]);
  const table = useReactTable(
    {
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    }
  );
  // interface Column {
  //   Header: string;
  //   accessor: string;
  //   width?: number;
  // }

  // interface Data {
  //   [key: string]: any;
  // }

  // interface Props {
  //   columns: Column[];
  //   data: Data[];
  // }

  function highlightColumnDivider(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const target = event.target as HTMLElement;
    target.classList.add(styles["hover"]);
  }

  function unhighlightColumnDivider(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const target = event.target as HTMLElement;
    target.classList.remove(styles["hover"]);
  }

  return (
    <div className={styles["dataGridhtml"]}>
      <i id="ruler" hidden></i>
      <table id={"gridjs_0"} className={styles["dataGridtable"]}>
        <thead>
          {table.getHeaderGroups().map((headerGroup, value) => (
            <tr key={`${headerGroup.id}${value}`}>
              {headerGroup.headers.map((header, value: number) => (
                <th key={`${header.id}${value}`} className={styles["dataGridth"]} data-column-id={columns[value].header} scope="col" onMouseEnter={highlightColumnDivider} onMouseLeave={unhighlightColumnDivider} {...setListeners}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                <div className={styles["columndivider"]}></div></th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={styles["dataGridtbody"]}>
          {table.getRowModel().rows.map((row, value: number) => (
            <tr id={"tr" + value.toString()} key={`${row.id}${value}`} className="gridjs-tr">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={styles["dataGridtd"]}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className={styles["dataGridtfoot"]}>
          {table.getFooterGroups().map((footerGroup, value: number) => (
            <tr key={`${footerGroup.id}${value}`}>
              {footerGroup.headers.map((header) => (
                <th key={`${header.id}${value}`}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
    </div>
  );
}

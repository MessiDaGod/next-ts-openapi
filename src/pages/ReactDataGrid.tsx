import { css } from "@linaria/core";
import { exportToCsv, exportToPdf, exportToXlsx } from "./exportUtils";
import DataGrid from "react-data-grid";
import dimensions from "../../public/Dimensions.json";
import { useState } from "react";

// const columns = [
//   { key: 'id', name: 'ID' },
//   { key: 'title', name: 'Title' }
// ];

const myColumns = Object.keys(dimensions[0]).map((key) => ({ key, name: key }));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const myRows = Object.values(dimensions).map((row, index: number) => ({
  index,
  ...row,
}));

// const rows = [
//   { id: 0, title: 'Example' },
//   { id: 1, title: 'Demo' }
// ];

// const toolbarClassname = css`
//   display: flex;
//   justify-content: flex-end;
//   gap: 8px;
//   margin-block-end: 8px;
// `;

// function isColumnHidden<T>(data: T[], columnName: string): boolean {
//   if (Array.isArray(data)) {
//     if (columnName.toLowerCase() === 'account' || columnName.toLowerCase() === 'person')
//       return false;
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//     const columnData = data.map((row) => row[columnName]);
//     return columnData.every(
//       (value) =>
//         value === null ||
//         value === '' ||
//         value === '0' ||
//         value === '-1' ||
//         value === '0.000000' ||
//         value === 'NULL' ||
//         value === 0
//     );
//   }
//   return true;
// }

function ExportButton({
  onExport,
  children,
}: {
  onExport: () => Promise<unknown>;
  children: React.ReactChild;
}) {
  const [exporting, setExporting] = useState(false);
  return (
    <button
      disabled={exporting}
      onClick={async () => {
        setExporting(true);
        await onExport();
        setExporting(false);
      }}
    >
      {exporting ? "Exporting" : children}
    </button>
  );
}

export default function Dimensions({ direction }) {
  const gridElement = (
    <DataGrid columns={myColumns} rows={myRows} direction={"ltr"} />
  );

  return (
    <>
      <div style={{ color: "white" }}>{gridElement}</div>
    </>
  );
}

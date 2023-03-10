import { useState } from "react";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";
import GenericDropdown from "./GenericDropdown";
// import GoodColumns from "../../public/GoodColumns.json";
// import dimensions from "../../public/Dimensions.json";
// import DynamicGridProps from "./DynamicGrid";
import { ExportButton } from "./ExportButton";
import { Log, exportCsv, upsertTableData } from "./utils";
import { exportToPdf, exportToXlsx } from "./exportUtils";
import DataGrid from "react-data-grid";
import dimensions from "../../public/Dimensions.json";

export default function Grid() {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState("");
  const [numItems, setNumItems] = useState<number>(2);
  const tableRef = React.useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const propertyInputId = React.useId();

  async function handleSetItem(e) {
    setItem(e);
    setStatus("submitting");
    try {
      await submitForm(item);
      setStatus("success");
    } catch (err) {
      setStatus("typing");
      setError(err);
    }
    await submitForm(item);
  }

  async function handleTextareaChange(e) {
    setNumItems(e.target.value);
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitForm(item);
      setStatus("success");
    } catch (err) {
      setStatus("typing");
      setError(err);
    }
  }

  const myColumns = Object.keys(dimensions[0]).map((key) => ({
    key,
    name: key,
  }));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const myRows = Object.values(dimensions).map((row, index: number) => ({
    index,
    ...row,
  }));
  const gridElement = (
    <DataGrid columns={myColumns} rows={myRows} direction={"ltr"} />
  );

  const dynamicGrid = (
    <DynamicGrid
      key={item}
      selectItem={item}
      showPagination={true}
      numItems={numItems}
    />
  );


  return (
    <>
      <section
        className="flex flex-grow p-4 gap-4 overflow-x-auto"
        style={{
          flexFlow: "row nowrap",
          placeContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        <div
          className="rounded"
          style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
        >
          <div className="w-full bg-white shadow flex rounded items-center">
            <div className="flex-1 relative flex items-center">
              <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                <Dropdown
                  jsonFileName="GetOptions"
                  label="Choose Item"
                  onItemChange={(e) => handleSetItem(e)}
                  showCheckbox={true}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded"
          style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
        >
          <div className="w-full bg-white shadow flex rounded items-center">
            <div className="flex-1 relative flex items-center">
              <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                <GenericDropdown
                  selectItem={"GetVendors"}
                  showPagination={true}
                  showCheckbox={false}
                  tableRef={tableRef}
                  dropdownValue={inputValue}
                  isMultiple={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="rounded"
          style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
        >
          <div className="w-full bg-white shadow flex rounded items-center">
            <div className="flex-1 relative flex items-center">
              <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                <GenericDropdown
                  selectItem={"GetPropOptions"}
                  showPagination={true}
                  showCheckbox={false}
                  tableRef={tableRef}
                  dropdownValue={inputValue}
                  isMultiple={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="rounded"
          style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
        >
          <div className="w-full bg-white shadow flex rounded items-center">
            <div className="flex-1 relative flex items-center">
              <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                <GenericDropdown
                  selectItem={"GetAccounts"}
                  showPagination={true}
                  showCheckbox={false}
                  tableRef={tableRef}
                  dropdownValue={inputValue}
                  isMultiple={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="rounded"
          style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
        >
          <div className="w-full shadow flex rounded items-center">
            <div className="flex-1 relative flex items-center">
              <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
                <form
                  style={{
                    color: "black",
                    borderRadius: "6px",
                    width: "50px",
                    alignContent: "center",
                  }}
                >
                  <input
                    type="number"
                    value={numItems}
                    onChange={handleTextareaChange}
                    disabled={false}
                    style={{
                      color: "black",
                      borderRadius: "6px",
                      width: "inherit",
                      alignContent: "center",
                      height: "30px",
                    }}
                  />
                  <br />
                  {error !== null && <p className="Error">{error.message}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
        <div
          className="rounded"
          style={{ order: "1", flex: "0 1 auto", alignSelf: "auto" }}
        >
          <div className="w-full shadow flex rounded items-center">
            <div className="flex-1 relative flex items-center">
              <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
                <button onClick={upsertTableData} className="button">
                  Post Data
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={"toolbarClassname"}>
          <ExportButton
            onExport={() => exportCsv()}
          >
            Export to CSV
          </ExportButton>
          <ExportButton
            onExport={() => exportToXlsx(dynamicGrid, "Dimensions.xlsx")}
          >
            Export to XSLX
          </ExportButton>
          <ExportButton
            onExport={() => exportToPdf(dynamicGrid, "Dimensions.pdf")}
          >
            Export to PDF
          </ExportButton>
        </div>
      </section>
      <div style={{ flexDirection: "column", flexWrap: "wrap", order: 5 }}>
        <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
          <section style={{ paddingTop: "1rem" }} ref={tableRef}>
            {status === "success" && dynamicGrid}
          </section>
        </div>
      </div>
    </>
  );
}

function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer === 0;
      if (shouldError) {
        reject(new Error("Please enter a # larger than 0!"));
      } else {
        resolve();
      }
    }, 100);
  });
}

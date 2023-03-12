import { useState } from "react";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";
import GenericDropdown from "./GenericDropdown";
import cn from 'classnames';
// import GenericDropdown from "./GenericDropdown";
// import GoodColumns from "../../public/GoodColumns.json";
// import dimensions from "../../public/Dimensions.json";
// import DynamicGridProps from "./DynamicGrid";
import { ExportButton } from "./ExportButton";
import { GetServerSideProps } from "next";
import { Log, getTableData, upsertTableData } from "./utils";
import { css } from "@linaria/core";
import { exportToCsv, exportToPdf, exportToXlsx } from "./exportUtils";
import DataGrid from "react-data-grid";
import dimensions from "../../public/Dimensions.json";
import ReactDataGrid from "./ReactDataGrid";



export default function Grid({}) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState("");
  const [numItems, setNumItems] = useState<number>(5);
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


  function handleNotifs(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    const notificationsIcon = document.getElementById("notifications-icon");
    const notificationsPopup = document.getElementById("notifications-popup");

    // Toggle the popup's visibility when the icon is clicked
    notificationsPopup.style.display =
      notificationsPopup.style.display === "none" ? "flex" : "none";

      notificationsPopup.style.placeContent = "flex-end";
      notificationsPopup.style.alignItems = "flex-end";

    notificationsIcon.style.color =
      notificationsPopup.style.display === "none" ? "white" : "lime";
    // // Position the popup below and to the left of the icon
    // notificationsPopup.style.top = `${
    //   notificationsIcon.offsetTop + notificationsIcon.offsetHeight
    // }px`;
    // notificationsPopup.style.left = `${notificationsIcon.offsetLeft}px`;
  }

  if (typeof window !== "undefined") {
    // code that uses the document object goes here
    document.addEventListener("click", (event) => {
      const notificationsPopup = document.getElementById("notifications-popup");
      const targetNode = event.target as Node;
      if (notificationsPopup && !notificationsPopup.contains(targetNode)) {
        // hide the popup
      }
    });
  }

  function handleMarkAsRead(e) {
    const marIcon = e.target as HTMLElement;
    marIcon.style.transition = "200ms cubic-bezier(.4,0,.2,1) 0ms";
    marIcon.style.transform = "scale(1.2)";
    marIcon.style.fill = "lime";
    setTimeout(() => {
      marIcon.style.fill = "black";
    }, 1000);
  }

  return (
    <>
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
                    value={inputValue}
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
                    value={inputValue}
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
                    value={inputValue}
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
          <div
            className="rounded"
            style={{ order: "1", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="w-full shadow flex rounded items-center">
              <div className="flex-1 relative flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
                  <button onClick={getTableData} className="button">
                    Get Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={"toolbarClassname"}>
            <ExportButton
              onExport={() => exportToCsv(dynamicGrid, "Dimensions.csv")}
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
      </>
      <div
        style={{ flexDirection: "column", flexWrap: "wrap", order: 5 }}
      >
        <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative">
          <section style={{ paddingTop: "1rem" }} ref={tableRef}>
            {status === "success" && (
              dynamicGrid
            )}
          </section>
        </div>
      </div>




      <span
        id="notifications-icon"
        className={cn("material-symbols-outlined", "white")}
        style={{
          paddingLeft: "10px",
          zIndex: 1000,
          top: "1rem",
          right: "1rem",
          order: 0,
          position: "fixed",
        }}
        onClick={handleNotifs}
      >
        notifications
      </span>
      <div id="notifications-popup" className="notifications-popup">
        <div className="mud-popover-provider">
          <div
            id="popovercontent"
            data-ticks="638142089517979340"
            className="mud-popover mud-popover-open mud-popover-top-left mud-popover-anchor-bottom-left mud-popover-overflow-flip-onopen mud-paper mud-elevation-8"
            style={{
              transitionDuration: "251ms",
              transitionDelay: "0ms",
              zIndex: "calc(var(--mud-zindex-popover) + 3)",
              // left: "1825.63px",
              // top: "32.3264px",
            }}
            data-mudpopover-flip="flipped"
          >
            <div className="mud-list mud-list-padding">
              <div className="d-flex justify-space-between align-center px-2">
                <h6 className="mud-typography mud-typography-subtitle2">
                  Notifications
                </h6>
                <button
                  type="button"
                  className="mud-button-root mud-button mud-button-text mud-button-text-primary mud-button-text-size-medium mud-ripple ml-16 mr-n2 mud-text-white"
                >
                  <span className="mud-button-label" >
                    <span className="mud-button-icon-start mud-button-icon-size-medium">
                      <svg
                        className="mud-icon-root mud-svg-icon mud-icon-size-medium"
                        focusable="false"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        onClick={handleMarkAsRead}
                      >
                        <path d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"></path>
                      </svg>
                    </span>
                    Mark as read
                  </span>
                </button>
              </div>
              <div
                id="nothingnew"
                className="d-flex justify-center align-center px-2 py-8 relative"
              >
                <h6 className="mud-typography mud-typography-subtitle2 mud-text-white my-12">
                  Nothing new :(
                </h6>
              </div>
            </div>
          </div>
        </div>
        <ul></ul>
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

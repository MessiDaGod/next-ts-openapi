import { useState } from "react";
import cn from "classnames";
import gridStyles from "./Grid.module.scss";
import genericStyles from "./GenericDropdown.module.scss";
import dynamicStyles from "./DynamicGrid.module.scss";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";
import DataGridDropdown from "./DataGridDropdown";
import GenericDropdown from "./GenericDropdown";
import SingleGenericDropdown from "./SingleGenericDropdown";
// import GenericDropdown from "./GenericDropdown";
// import GoodColumns from "../../public/GoodColumns.json";
// import dimensions from "../../public/Dimensions.json";
// import DynamicGridProps from "./DynamicGrid";
import {
  ColumnWidths,
  CustomError,
  Log,
  headerize,
  isColumnHidden,
  paddingDiff,
  paddingDiffY,
  parseValue,
} from "./utils";

export default function Grid({}) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState("");
  const [numItems, setNumItems] = useState<number>(1);
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

  // React.useEffect(() => {
  //   setNumItems(1);
  // }, []);

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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  function handleClick(e) {
    setInputValue(
      (e.target as HTMLElement).parentElement.children[2].textContent
    );
    // const value = (e.target as HTMLElement).parentElement.children[2]
    //   .textContent;
    // value && setInputValue(value);

    if (tableRef?.current) {
      const allCells = Array.from(
        new Set([
          ...(tableRef.current as HTMLElement).querySelectorAll(
            'div[data-column-id="' + "PROPERTY" + '"][class*="td"]'
          ),
        ])
      );
      allCells.forEach((cell) => {
        const children = Array.from(
          new Set([...(cell as HTMLElement).children])
        );

        children.forEach((child) => {
          (child as HTMLElement).querySelectorAll("input")[0].value =
            inputValue;
          (child as HTMLElement).querySelectorAll("input")[0].textContent =
            inputValue;
        });
      });
    }
    // setIsActiveDropdown(false);
    // setShowSearchBox(false);
  }

  return (
    <>
      <>
        <section
          className="h-full flex flex-grow p-4 gap-4 overflow-x-auto"
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
            <div className="h-full w-full bg-white shadow flex rounded items-center">
              <Dropdown
                jsonFileName="GetOptions"
                label="Choose Item"
                onItemChange={(e) => handleSetItem(e)}
                showCheckbox={true}
              />
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="h-full w-full bg-white shadow flex rounded items-center">
              <div className="flex-1 relative h-full flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                  <SingleGenericDropdown
                    selectItem={"GetPropOptions"}
                    showPagination={true}
                    showCheckbox={false}
                    tableRef={tableRef}
                    value={inputValue}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="h-full w-full bg-white shadow flex rounded items-center">
              <div className="flex-1 relative h-full flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                  <SingleGenericDropdown
                    selectItem={"GetVendors"}
                    showPagination={true}
                    showCheckbox={false}
                    tableRef={tableRef}
                    value={inputValue}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="h-full w-full bg-white shadow flex rounded items-center">
              <div className="flex-1 relative h-full flex items-center">
                <div className="text-sm font-medium text-gray-700 pl-4 pr-8 py-6 relative white">
                  <SingleGenericDropdown
                    selectItem={"GetAccounts"}
                    showPagination={true}
                    showCheckbox={false}
                    tableRef={tableRef}
                    value={inputValue}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded"
            style={{ order: "0", flex: "0 1 auto", alignSelf: "auto" }}
          >
            <div className="h-full w-full shadow flex rounded items-center">
              <div className="flex-1 relative h-full flex items-center">
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
        </section>
      </>
      <div
        style={{ flexDirection: "column", flexWrap: "wrap", order: 5 }}
        ref={tableRef}
      >
        {status === "success" && (
          <DynamicGrid
            key={item}
            selectItem={item}
            showPagination={true}
            numItems={numItems}
          />
        )}
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

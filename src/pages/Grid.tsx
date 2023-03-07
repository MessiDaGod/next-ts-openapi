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
// import GenericDropdown from "./GenericDropdown";
// import GoodColumns from "../../public/GoodColumns.json";
// import dimensions from "../../public/Dimensions.json";
// import DynamicGridProps from "./DynamicGrid";

export default function Grid({
  tableRef,
  columns,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
  columns: string[];
}) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState("");
  const [numItems, setNumItems] = useState<number>(1);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

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

  React.useEffect(() => {
    console.info("Grid useEffect ran");
    setNumItems(1);
  }, []);

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

  return (
    <>
      <div className={gridStyles["container"]}>
        <Dropdown
          className={gridStyles["dynamicgrid-dd"]}
          jsonFileName="GetOptions"
          label="Choose Item"
          onItemChange={(e) => handleSetItem(e)}
          showCheckbox={true}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <GenericDropdown
          className={gridStyles["dynamicgrid-dd"]}
          selectItem={"GetPropOptions"}
          showPagination={true}
          showCheckbox={false}
        />
      </div>
      <div className={gridStyles["container"]}>
        <form>
          <input
            className={cn(gridStyles["rz-textbox"], gridStyles["input"])}
            type="number"
            value={numItems}
            onChange={handleTextareaChange}
            disabled={false}
          />
          <br />
          {error !== null && <p className="Error">{error.message}</p>}
        </form>
        {status === "success" && (
          <DynamicGrid
            className={dynamicStyles["dynamicgrid-dd"]}
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

import { useState } from "react";
import cn from "classnames";
import styles from "./Home.module.scss";
import stylesWithin from "./GenericDropdown.module.scss";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";
import DataGridDropdown from "./DataGridDropdown";
import GenericDropdown from "./GenericDropdown";
import { Log, isColumnHidden } from "./utils";
import MultiDropdown from "./MultiDropdown";
// import GenericDropdown from "./GenericDropdown";
// import GoodColumns from "../../public/GoodColumns.json";
// import dimensions from "../../public/Dimensions.json";
// import DynamicGridProps from "./DynamicGrid";
import properties from "../../public/propOptions.json";
import { TableHeader } from "./TableHeader";

export default function Grid({
  tableRef,
}: {
  tableRef?: React.RefObject<HTMLDivElement>;
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
    handleOnClick();
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

  function handleOnClick() {
    Log("click handled!!!!!!");
    const elementsWithZIndex = document.querySelectorAll('[style*="z-index"]');
    elementsWithZIndex.forEach((element) => {
      if ((element as HTMLElement).id !== "table")
        (element as HTMLElement).style.zIndex = "0";
    });
  }
  const data = properties;
  const columns = Object.keys(data[0]);
  const header = columns.map((cols, idx: number) => {
    return (
      !isColumnHidden(data, cols) && (
        <TableHeader key={cols} columnName={cols}>
          <div className={styles["coldivider"]}></div>
        </TableHeader>
      )
    );
  });

  return (
    <div className={styles["container"]}>
      {/* <div className={stylesWithin["table-container"]}> */}
      {/* <div className={stylesWithin["ddTable"]}> */}
      {/* <div className={stylesWithin["tr"]} data-row-id="0">
        <div className={stylesWithin["td"]} data-column-id="DROPDOWN">
          <Dropdown
            jsonFileName="GetOptions"
            label="Choose Item to Display"
            onItemChange={(e) => handleSetItem(e)}
            showCheckbox={true}
          />
        </div>
        <div className={stylesWithin["td"]}>
          <GenericDropdown
            selectItem={"GetPropOptions"}
            showPagination={true}
            showCheckbox={false}
            columns={columns["Property"]}
          />
        </div>
        <div className={stylesWithin["td"]} data-column-id="VENDOR">
          <GenericDropdown
            selectItem={"GetVendors"}
            showPagination={true}
            showCheckbox={false}
            columns={columns["Vendor"]}
          />
        </div>{" "}
        <form
          // onSubmit={handleSubmit}
          style={{
            zIndex: 1,
            margin: "20px",
          }}
        >
          <input
            className={cn(styles["rz-textbox"], styles["input"])}
            type="number"
            value={numItems}
            onChange={handleTextareaChange}
            disabled={false}
          />
          <br />
          {error !== null && <p className="Error">{error.message}</p>}
        </form>
      </div> */}
      <Dropdown
        jsonFileName="GetOptions"
        label="Choose Item to Display"
        onItemChange={(e) => handleSetItem(e)}
        showCheckbox={true}
      />

      {/* </div> */}
      {/* </div> */}
      {status === "success" && (
        <DynamicGrid
          // className={styles["dynamicgrid-dd"]}
          key={item}
          selectItem={item}
          showPagination={true}
          numItems={numItems}
        />
      )}
    </div>
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

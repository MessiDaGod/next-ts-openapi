import { useState } from "react";
import cn from "classnames";
import styles from "./Grid.module.scss";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";
import DataGridDropdown from "./DataGridDropdown";
import GenericDropdown from "./GenericDropdown";
import GoodColumns from "../../public/GoodColumns.json";
import dimensions from "../../public/Dimensions.json";

export default function Grid() {
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
<div className={styles["container"]}>
      <Dropdown
        className={styles["dynamicgrid-dd"]}
        jsonFileName="GetOptions"
        label="Choose Item to Display"
        onItemChange={(e) => handleSetItem(e)}
        showCheckbox={true}
      />
        <form
          // onSubmit={handleSubmit}
          style={{
            display: "block",
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

        {status === "success" && (
          <DynamicGrid
            // className={styles["dynamicgrid-dd"]}
            key={item}
            selectItem={item}
            showPagination={true}
            numItems={numItems}
            // sourceData={JSON.parse(JSON.stringify(dimensions))}
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

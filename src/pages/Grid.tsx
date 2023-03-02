import { useState } from "react";
import cn from "classnames";
import styles from "./GridDropdown.module.scss";
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
  const [numItems, setNumItems] = useState<number>(0);
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
      <Dropdown
        style={{
          display: "block",
          zIndex: 2,
        }}
        jsonFileName="GetOptions"
        label="Choose Item to Display"
        onChange={(e) => handleSetItem(e)}
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
            style={{
              display: "block",
              padding: "10px",
              width: "50px",
              cursor: "pointer",
              marginLeft: "375px",
              top: "0px",
            }}
            className={cn(styles["rz-textbox"], styles["findcomponent"])}
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
            style={{
              display: "block",
              marginLeft: "10px",
              marginTop: "50px",
              position: "absolute",
            }}
            key={item}
            selectItem={item}
            showPagination={true}
            numItems={numItems}
            // sourceData={JSON.parse(JSON.stringify(dimensions))}
          />
        )}

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

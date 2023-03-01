import { useState } from "react";
import cn from "classnames";
import styles from "./GridDropdown.module.scss";
import React from "react";
import Dropdown from "./dropdown";
import DynamicGrid from "./DynamicGrid";

export default function Grid() {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("typing");
  const [item, setItem] = useState('');
  const [numItems, setNumItems] = useState<number>(0);

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
    <div>
      <div className={styles["table"]}>
        <div className={styles["tr"]}>
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
        </div>
        <div className={styles["tr"]}>
          <form
            // onSubmit={handleSubmit}
            style={{
              display: "block",
              zIndex: 1,
              margin: "20px",
            }}
          >
            <input
              style={{ top: "50px", display: "block", padding: "10px", width: "50px", cursor: "pointer" }}
              className={cn(styles["rz-textbox"], styles["findcomponent"])}
              type="number"
              value={numItems}
              onChange={handleTextareaChange}
              disabled={false}
            />
            <br />
            {/* <button disabled={numItems === 0}>Submit</button> */}
            {error !== null && <p className="Error">{error.message}</p>}
          </form>
        </div>
        <div className={styles["tr"]}>
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
            />
          )}
        </div>
      </div>
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

import Dropdown from "./Dropdown";
import React, { useState } from "react";
import DynamicGrid from "./DynamicGrid";
import styles from "./GridDropdown.module.scss";

function Grid({}) {
  const [item, setItem] = useState(null);

  function handleSetItem(e) {
    setItem(e);
  }

  return (
    <table>
      <thead>
        <tr>
          <td>
            <div
              className={styles["tr"]}
              style={{ display: "flex", width: "auto" }}
            >
              <Dropdown
                style={{
                  position: "absolute",
                }}
                jsonFileName="GetOptions"
                label="Choose Item to Display"
                onChange={(e) => handleSetItem(e)}
                showCheckbox={true}
              />
            </div>
          </td>
        </tr>
        <tr style={{ height: "10px" }}>
          <td></td>
        </tr>
        <tr>
          <td>
            <div
              style={{ display: "inline-block" }}
              className={styles["tr"]}
            >
              <DynamicGrid
                style={{ zIndex: -1, padding: "0" }}
                key={item}
                selectItem={item}
                showPagination={false}
              />
            </div>
          </td>
        </tr>
      </thead>
    </table>
  );
}

export default Grid;

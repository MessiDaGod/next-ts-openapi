import Dropdown from "./dropdown";
import React, { useState } from "react";
import { getPropOptions } from "hooks/getPropOptions";
import DataGridDropdown from "./DataGridDropdown";
import DynamicGrid from "./DynamicGrid";
import styles from "./DataGridDropdown.module.scss";

// const properties = getPropOptions(1000);

function Grid({}) {
  const [item, setItem] = useState(null);

  function handleSetItem(e) {
    setItem(e);
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <td className={styles["td"]}>
              <div
                className={styles["tr"]}
                style={{ display: "flex", width: "auto" }}
              >
                <Dropdown
                  style={{
                    marginBottom: "30px",
                    position: "absolute",
                    zIndex: 1000000,
                  }}
                  jsonFileName="GetOptions"
                  label="Choose Item to Display"
                  onChange={(e) => handleSetItem(e)}
                  showCheckbox={true}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td className={styles["td"]}>
              <div
                style={{ display: "inline-block", top: "100ox" }}
                className={styles["tr"]}
              >
                <DynamicGrid
                  style={{ zIndex: -1 }}
                  key={item}
                  selectItem={item}
                />
              </div>
            </td>
          </tr>
        </thead>
      </table>
    </>
  );
}

export default Grid;

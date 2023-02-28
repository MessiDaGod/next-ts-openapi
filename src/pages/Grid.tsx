import Dropdown from "./dropdown";
import React from "react";
import { getPropOptions } from "hooks/getPropOptions";
import DataGridDropdown from "./DataGridDropdown";
import DynamicGrid from "./DynamicGrid";

const properties = getPropOptions(1000);

function Grid({}) {
  return (
    <>
      <div style={{display: "flex" }}>
        <Dropdown
          style={{ marginBottom: "30px", position: "relative", zIndex: 2 }}
          jsonFileName="GetOptions"
          label="Choose Item to Display"
        />
      </div>
      <div style={{ display: "flex",  top: "100ox"  }}>
        <DynamicGrid
          style={{ zIndex: -1 }}
          key={"GetDimensions"}
          selectItem={"GetDimensions"}
        />
      </div>
    </>
  );
}

export default Grid;

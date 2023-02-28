import Dropdown from "./dropdown";
import React, { useState } from "react";
import { getPropOptions } from "hooks/getPropOptions";
import DataGridDropdown from "./DataGridDropdown";
import DynamicGrid from "./DynamicGrid";

// const properties = getPropOptions(1000);

function Grid({}) {
const [item, setItem] = useState(null);

function handleSetItem(e) {
  setItem(e);
}

  return (
    <>
      {/* <div style={{display: "flex", width: "100%" }}>
        <Dropdown
          style={{ marginBottom: "30px", position: "absolute", zIndex: 1000000 }}
          jsonFileName="GetOptions"
          label="Choose Item to Display"
          onChange={(e) => handleSetItem(e)}
          showCheckbox={true}
        />
      </div>
      <div style={{ display: "inline-block",  top: "100ox"  }}>
        <DynamicGrid
          style={{ zIndex: -1 }}
          key={item}
          selectItem={item}
        />
      </div> */}

<div className={}>
        <Dropdown
          style={{ marginBottom: "30px", position: "absolute", zIndex: 1000000 }}
          jsonFileName="GetOptions"
          label="Choose Item to Display"
          onChange={(e) => handleSetItem(e)}
          showCheckbox={true}
        />
      </div>
<div className={}>
      <div style={{ display: "inline-block",  top: "100ox"  }}>
        <DynamicGrid
          style={{ zIndex: -1 }}
          key={item}
          selectItem={item}
        />
      </div>
    </>
  );
}

export default Grid;

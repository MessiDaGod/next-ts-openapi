import Dropdown from "./dropdown";
import React from "react";
import { getPropOptions } from "hooks/getPropOptions";
import DataGridDropdown from "./DataGridDropdown";

const properties = getPropOptions(1000);

const Grid: React.FC = ({}) => (
  <>
    <Dropdown jsonFileName="GetOptions" label="Choose Item to Display" />
  </>
);

export default Grid;

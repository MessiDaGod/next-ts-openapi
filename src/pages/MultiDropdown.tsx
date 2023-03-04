import React, {
  CSSProperties,
  useState,
  useEffect,
  HTMLAttributes,
} from "react";
import styles from "./GenericDropdown.module.scss";
import cn from "classnames";
import properties from "../../public/propOptions.json";
import GoodColumns from "../../public/GoodColumns.json";
import { Log, isColumnHidden } from "./utils";

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  jsonFileName: string;
  label: string;
  style?: CSSProperties;
  showCheckbox?: boolean;
  onItemChange?: (event: string) => void;
}

interface ButtonProps {
  label: string;
  children?: any;
  id: string;
  style?: CSSProperties;
}

interface Item {
  Value: string;
}
interface Menu {
  Items: Item[];
}

const Button: React.FC<ButtonProps> = ({ children }) => {
  return (
    <button
      key={"btn"}
      className={cn(styles["button"])}
      style={{ background: "white", color: "black", fontWeight: "bold" }}
    >
      {children}
    </button>
  );
};

const MultiDropdown: React.FC<DropdownProps> = ({
  jsonFileName = {},
  label,
  style,
  showCheckbox,
  className,
  onItemChange,
}) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<[] | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(true);
  const [sortState, setSortState] = React.useState<boolean>(true);

  useEffect(() => {
    // async function getItems() {
    //   fetch(`${jsonFileName}.json`)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       setItems(data);
    //     });
    // }
    // getItems();
    setItems(properties as []);
  }, []);

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };

  function Checkbox({}) {
    return (
      <label>
        <input
          id="checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheckboxChange(e)}
        />
        Dropdown with MouseEnter
      </label>
    );
  }

  function handleMouseEnter(e) {
    setShowDropdown(true);
  }

  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    handleItemChange(item);
    setShowDropdown(false);
  };

  function handleItemChange(item: string) {
    // console.log("Dropdown changed to " + item);
    onItemChange(item);
  }

  function render(): JSX.Element[] | null {
    const myType =
      jsonFileName === "GetPropOptions"
        ? "Property"
        : jsonFileName === "GetVendors"
        ? "Vendor"
        : jsonFileName === "GetAccounts"
        ? "Account"
        : null;

    if (!myType) return null;
    const myColumns = GoodColumns[myType];

    const columnKeys = Object.entries(myColumns).map(
      ([key, value], index: number) => {
        return { Item: myType, Index: index, Name: value["Name"] };
      }
    );

    const filteredColumns = myType && columnKeys.map((col) => col.Name);
    Log(filteredColumns);
    const headerRow = [...filteredColumns].map((col, index: number) => (
      <>
        <div style={style} className={cn(styles["table-container"])}>
          <div id={"gridjs_"} className={styles["divTable"]}>
            <div className={styles["tr"]} data-row-id="0">
              <div
                key={col}
                className={styles["td"]}
                style={{ display: "flex", flexDirection: "row" }}
                data-column-id={col}
                hidden={isColumnHidden(items, col)}
              >
                {col}
                <span
                  className={`${"material-symbols-outlined"} ${
                    styles["black"]
                  }`}
                >
                  {!sortState ? "expand_more" : "expand_less"}
                </span>
                <div className={styles["coldivider"]}></div>
              </div>
            </div>

            <div key={"tbody"} className={styles["tbody"]}></div>
          </div>
        </div>
      </>
    ));

    return headerRow;
  }

  const headerRow = render();

  return (
    <>
      <div
        className={className}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button id="dd" label={label}>
          {selectedItem}
        </Button>
        {headerRow}
        {/* {showDropdown &&
          items?.Items.map((value, index) => (
            <span
              key={index}
              onClick={() => handleItemClick(value.Value)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={styles["dropdown-item"]}
            >
              {value.Value}
            </span>
          ))} */}
      </div>
    </>
  );
};

export default MultiDropdown;

import React, { CSSProperties, useState, useEffect } from "react";
import DynamicGrid from "./DynamicGrid";
import styles from "./Home.module.scss";
import { cn } from "./classNames";

interface DropdownProps {
  jsonFileName: string;
  label: string;
  style?: CSSProperties;
  showCheckbox?: boolean;
  onChange?: (event: string) => void;
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

const Dropdown: React.FC<DropdownProps> = ({
  jsonFileName = {},
  label,
  style,
  showCheckbox,
  onChange,
}) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<Menu | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    async function getItems() {
      fetch(`${jsonFileName}.json`)
        .then((response) => response.json())
        .then((data) => {
          setItems(data);
        });
    }
    getItems();
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

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    handleItemChange(item);
    setShowDropdown(false);
  };

  function handleItemChange(item: string) {
    console.log("Dropdown changed to " + item);
    onChange(item);;
  }

  return (
    <>
      <div
        className={styles["dropdown"]}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button id="dd" label={label}>
          {selectedItem}
        </Button>
        {showDropdown &&
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
          ))}
      </div>
    </>
  );
};

export default Dropdown;

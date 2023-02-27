import React, { CSSProperties, useState, useEffect } from "react";
import DynamicGrid from "./DynamicGrid";
import styles from "../styles/Home.module.scss";
import { cn } from "./classNames";
import PropertyDropdown from "./PropertyDropdown";
import DataGridDropdown from "./DataGridDropdown";

interface DropdownProps {
  jsonFileName: string;
  label: string;
  style?: CSSProperties;
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
}) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<Menu | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

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

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowDropdown(false);
  };

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
      <DynamicGrid key={selectedItem} selectItem={selectedItem} />
    </>
  );
};

export default Dropdown;

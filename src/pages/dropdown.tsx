import React, { CSSProperties, useState, useEffect } from "react";
import DynamicGrid from "./dynamicGrid";
import styles from "../styles/Home.module.scss";

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
      style={{
        width: "150px",
        borderStyle: "solid",
        borderColor: "white",
        borderWidth: "1px",
        cursor: "pointer",
        margin: "10px",
        marginBottom: "0px",
        borderRadius: "10px",
      }}
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
  }, [jsonFileName]);

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
            <a
              key={index}
              onClick={() => handleItemClick(value.Value)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={styles["dropdown-item"]}
            >
              {value.Value}
            </a>
          ))}
      </div>
      <>{DynamicGrid(selectedItem)}</>
    </>
  );
};
export default Dropdown;

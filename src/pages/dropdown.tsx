import React, { useState, useEffect } from "react";
import styles from "./connectionDropdown.module.css";

interface DropdownProps {
  jsonFileName: string;
  label: string;
  onChange?: (item: string) => void;
}

interface ButtonProps {
  label: string;
  children?: any;
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
      className={`${styles.btn} ${styles["btn-101"]} ${styles["btn-glow"]}`}
    >
      {children}
    </button>
  );
};

const Dropdown: React.FC<DropdownProps> = ({ jsonFileName = {}, label, onChange }) => {
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
  }, [jsonFileName, label, items]);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    if (onChange) {
      onChange(selectedItem);
    }
    setShowDropdown(false);
  };

  return (
    <div
      className={styles["dropdown"]}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button label={label}>{selectedItem}</Button>
      {showDropdown && (
        <ul className={styles.dropdown}>
          {items?.Items.map((item, index) => (
            <li
              key={index}
              onClick={() => handleItemClick(item.Value)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={
                hoveredItem === index
                  ? `${styles["dropdown-item"]} ${styles.hovered}`
                  : `${styles["dropdown-item"]}`
              }
            >
              {item.Value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

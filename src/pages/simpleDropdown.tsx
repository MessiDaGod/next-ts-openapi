import React, { useState, useEffect } from "react";
import styles from "./dropdown.module.css";
import { GetPropOptions } from "./api/Objects/PropOptions";
import { getVendors } from "./api/getVendors";

interface DropdownProps {
  jsonFileName: string;
  label: string;
}

interface ButtonProps {
  label: string;
  children?: any;
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

const SimpleDropdown: React.FC<DropdownProps> = ({
  jsonFileName = {},
  label,
}) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState<{ Get: string[] }>({ Get: [] });
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${jsonFileName}.json`);
      const json = await response.json();
      setData(json);
    }
    fetchData();
  }, [jsonFileName]);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);

  async function handleItemClick(item: string) {
    setSelectedItem(item);
    setShowDropdown(false);

    // add a switch statement here to handle different types of dropdowns

    switch (item) {
      case "GetPropOptions":
        await GetPropOptions();
      case "GetVendors":
        await getVendors();
    }
  }

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
          {data.Get.map((item, index) => (
            <li
              key={index}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={
                hoveredItem === index
                  ? `${styles["dropdown-item"]} ${styles.hovered}`
                  : `${styles["dropdown-item"]}`
              }
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SimpleDropdown;

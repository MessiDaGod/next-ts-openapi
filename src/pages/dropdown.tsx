import React, { useState, useEffect } from "react";
import styles from './dropdown.module.css';

interface DropdownProps {
  jsonFileName: string;
}

interface ButtonProps {
  label: string;
  children?: any;
}

const Button: React.FC<ButtonProps> = ({ label, children }) => {
  return (
    <button className={`${styles.btn} ${styles['btn-101']} ${styles['btn-glow']}`}>
      {children}
    </button>
  );
}

const Dropdown: React.FC<DropdownProps> = ({ jsonFileName }) => {
  const [selectedItem, setSelectedItem] = useState("Select Connection");
  const [showDropdown, setShowDropdown] = useState(false);
  const [myConnectionStrings, setConnectionStrings] = useState<Record<string, string>>({});
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the JSON data from an API or a local file
    fetch(`${jsonFileName}.json`)
      .then((response) => response.json())
      .then((data) => {
        // Get the ConnectionStrings object from the JSON data
        const { ConnectionStrings } = data;
        setConnectionStrings(ConnectionStrings);
      })
      .catch((error) => console.log(error));
  }, [jsonFileName]);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    console.info(item + " selected");
    setSelectedItem(item);
    setShowDropdown(false);
  };

  return (
    <div
      className={"dropdown rz-dropdown"}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button label="Select Connection">{selectedItem}</Button>
      {showDropdown && (
        <ul className={styles.dropdown}>
          {Object.entries(myConnectionStrings).map(([key, value], index) => (
            <li
              key={index}
              onClick={() => handleItemClick(key)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={hoveredItem === index ? `${styles['dropdown-item']} ${styles.hovered}` : `${styles['dropdown-item']}`}
            >
              {key}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

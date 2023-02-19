import React, { useState, useEffect } from "react";
import styles from './connectionDropdown.module.css';

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
    <button className={`${styles.btn} ${styles['btn-101']} ${styles['btn-glow']}`}>
      {children}
    </button>
  );
}

const Dropdown: React.FC<DropdownProps> = ({ jsonFileName = {}, label }) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  useEffect(() => {
    async function getItems() {

    if (items.length > 0)
    for (let i = 0; i < items.length; i++) {
        console.log(items[i]);
    }
    fetch(`${jsonFileName}.json`)
      .then((response) => response.json())
      .then((data) => {
        setItems(data);
      })
    }
    getItems();
  }, [jsonFileName, label, items]);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowDropdown(false);
  };

  return (
    <div
      className={styles['dropdown']}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button label={label}>{selectedItem}</Button>
      {showDropdown && (
        <ul className={styles.dropdown}>
          {Object.entries(items).map(([key], index) => (
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

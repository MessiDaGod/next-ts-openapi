import { cn } from "./classNames";
import React, { CSSProperties, useState, useEffect } from "react";
import styles from "../styles/Home.module.scss";
// import { setListeners } from "./helpers";

interface DropdownProps {
  jsonFileName: string;
  label: string;
  style?: CSSProperties;
  id?: string;
}

interface ButtonProps {
  label: string;
  children?: any;
  id: string;
  style?: CSSProperties;
}

// interface Item {
//   Value: string;
// }
// interface Menu {
//   Items: Item[];
// }

const Button: React.FC<ButtonProps> = ({ children }) => {
  return (
    <button className={cn(
      styles["button"]
    )}>
      {children}
    </button>
  );
};

const ConnectionDropdown: React.FC<DropdownProps> = ({
  jsonFileName = {},
  label,
  style,
  id,
}) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [myConnectionStrings, setConnectionStrings] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    async function getItems() {
      fetch(`${jsonFileName}.json`)
        .then((response) => response.json())
        .then((data) => {
          // Get the ConnectionStrings object from the JSON data
          const { ConnectionStrings } = data;
          setConnectionStrings(ConnectionStrings);
        });
    }
    getItems();
  }, [id, jsonFileName, label, style]);

  useEffect(() => {
    document.addEventListener("onload", (e) => {
      e.preventDefault();
      console.log("onload");
    });
  }, []);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowDropdown(false);
    setHoveredItem(null);
  };


  return (
    <div
      id={id}
      className={styles["dropdown"]}
      style={{ left: "79vw", width: "160px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button id="dd" label={label}>
        {selectedItem}
      </Button>
      {showDropdown &&
        Object.entries(myConnectionStrings).map(([key], index) => (
          <span
            key={key}
            onClick={() => handleItemClick(key)}
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ width: "160px" }}
            className={`${styles["dropdown-item"]} ${
              index === hoveredItem ? styles.hovered : ""
            }`}
          >
            {key}
          </span>
        ))}
    </div>
  );
};

export default ConnectionDropdown;


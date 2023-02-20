import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.scss";

interface DropdownProps {
  jsonFileName: string;
  label: string;
}

interface ButtonProps {
  label: string;
  children?: any;
}

const Button: React.FC<ButtonProps> = ({ children }) => {
  return <button>{children}</button>;
};

const ConnectionDropdown: React.FC<DropdownProps> = ({
  jsonFileName = {},
  label,
}) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [myConnectionStrings, setConnectionStrings] = useState<
    Record<string, string>
  >({});
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  useEffect(() => {
    async function getConnections() {
      // Fetch the JSON data from an API or a local file
      fetch(`${jsonFileName}.json`)
        .then((response) => response.json())
        .then((data) => {
          // Get the ConnectionStrings object from the JSON data
          const { ConnectionStrings } = data;
          setConnectionStrings(ConnectionStrings);
        });
    }
    getConnections();
  }, [jsonFileName, label]);

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
        style={{ position: "relative", display: "inline-block", zIndex: 10 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button label={label}>{selectedItem}</Button>
        {showDropdown &&
          Object.entries(myConnectionStrings).map(([key], index) => (
            <a
              key={index}
              onClick={() => handleItemClick(key)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`${styles["dropdown-item"]} ${styles.hovered}`}
            >
              {key}
            </a>
          ))}
      </div>
    </>
  );
};

export default ConnectionDropdown;

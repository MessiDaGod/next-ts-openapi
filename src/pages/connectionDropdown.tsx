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
    <button>
      {children}
    </button>
  );
}

const ConnectionDropdown: React.FC<DropdownProps> = ({ jsonFileName = {}, label }) => {
  const [selectedItem, setSelectedItem] = useState(label);
  const [showDropdown, setShowDropdown] = useState(false);
  const [myConnectionStrings, setConnectionStrings] = useState<Record<string, string>>({});
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
      })
      // .catch((error) => console.log(error));
      // fetch("/api/getConnectionValue")
      // .then((response) => response.json())
      // .then((data) => {
      //   setSelectedItem(data.value || label);
      // })
      // .catch((error) => console.error(error));
    }
    getConnections();
  }, [jsonFileName, label]);

  const handleMouseEnter = () => setShowDropdown(true);
  const handleMouseLeave = () => setShowDropdown(false);
  const handleItemClick = (item: string) => {
    // console.info(item + " selected");
    setSelectedItem(item);
    setShowDropdown(false);

    // const value = item;
    // const userId = 1;
    // const url = `/api/addOrUpdateConnection?value=${value}&userId=${userId}`;

    // fetch(url)
    //   .then(response => {
    //     return response.json();
    //   })
    //   .then(data => {
    //     console.log(data.message);
    //   })
    //   .catch(_error => {
    //     // console.info(error);
    //   });
  };

  return (
    <div
      className={styles['dropdown']}
      style={{ position: "relative", display: "inline-block", zIndex: 10}}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button label={label}>{selectedItem}</Button>
      {showDropdown && (
        <ul className={styles.dropdown}>
          {Object.entries(myConnectionStrings).map(([key], index) => (
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

export default ConnectionDropdown;

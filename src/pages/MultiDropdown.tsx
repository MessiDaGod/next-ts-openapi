import React, { CSSProperties, useState, useEffect, HTMLAttributes } from "react";
import styles from "./Home.module.scss";
import cn from "classnames";

interface MultiDropdownProps extends HTMLAttributes<HTMLDivElement> {
  jsonFileName: string;
  label: string;
  style?: CSSProperties;
  showCheckbox?: boolean;
  onItemChange?: (event: string) => void;
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

const MultiDropdown: React.FC<MultiDropdownProps> = ({
  jsonFileName = {},
  label,
  style,
  showCheckbox,
  className,
  onItemChange,
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
    // console.log("Dropdown changed to " + item);
    onItemChange(item);
  }

  return (
    <>
      <div
        className={className}
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

export default MultiDropdown;

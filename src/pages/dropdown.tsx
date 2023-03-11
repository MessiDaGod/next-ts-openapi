import React, {
  CSSProperties,
  useState,
  useEffect,
  HTMLAttributes,
} from "react";
import styles from "./Home.module.scss";
import cn from "classnames";
import { Log } from "./utils";

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
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

  function handleMouseEnter(e) {
    // Log("Mouse Enter dropdown.tsx");
    setShowDropdown(true);
  }
  function handleMouseLeave(e) {
    setShowDropdown(false);
  }

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
        // className={className}
        style={{ zIndex: 10000000, top: "0" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button id="dd" label={label}>
          {selectedItem}
        </Button>
        <div className={styles["dropdown-container"]}>
          <ul style={{ listStyleType: "none", position: "absolute", zIndex: 10000000 }}>
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
          </ul>
        </div>
      </div>
    </>
  );
};

export default Dropdown;

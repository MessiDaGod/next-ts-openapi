import React, { useState } from "react";

export function Checkbox(props) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e);
  };

  // React.useEffect(() => {

  // }, [isChecked]);

  return (
    <div>
      <label>
        <input
          id="checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheckboxChange(e.target.checked)} />Dropdown with MouseEnter
      </label>
    </div>
  );
}

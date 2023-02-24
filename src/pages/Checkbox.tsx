import React, { useState } from "react";

export function Checkbox(props) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  React.useEffect(() => {

  }, [isChecked]);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />Activate MouseOver
      </label>
      <div>{isChecked ? 1 : 0}</div>
    </div>
  );
}

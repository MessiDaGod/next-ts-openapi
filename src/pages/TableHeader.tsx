import { useState, useEffect } from "react";
import styles from "./GridDropdown.module.scss";

interface Props {
  children: React.ReactNode;
  columnName: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  initialState?: boolean;
}

export function TableHeader({
  children,
  columnName,
  initialState,
}: Props) {
  const [sortState, setSortState] = useState<boolean>(initialState ?? true);

  return (
    <div
      key={columnName}
      className={styles["th"]}
      style={{ width: "100px" }}
      data-column-id={columnName}
    >
        {columnName}
        <span
        onClick={() => setSortState(!sortState)}
          className={`${"material-symbols-outlined"} ${styles["black"]}`}
        >
          {!sortState ? "expand_more" : "expand_less"}
        </span>
      {children}
    </div>
  );
}

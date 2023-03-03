import { useState, useEffect } from "react";
import styles from "./GenericDropdown.module.scss";

interface Props {
  children: React.ReactNode;
  columnName: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  initialState?: boolean;
  initialWidth?: string | undefined;
}

export function TableHeader({
  children,
  columnName,
  initialState,
  initialWidth,
}: Props) {
  const [sortState, setSortState] = useState<boolean>(initialState ?? true);
  const [width, setWidth] = useState<string>(initialWidth ?? "100px");

  return (
    <div
      key={columnName}
      className={styles["th"]}
      style={{ width: width }}
      data-column-id={columnName}
    >
        {columnName}
        <span
        onClick={() => setSortState(!sortState)}
          className={`${"material-symbols-outlined"} black`}
        >
          {!sortState ? "expand_more" : "expand_less"}
        </span>
      {children}
    </div>
  );
}

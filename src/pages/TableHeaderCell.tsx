import { useState, useEffect } from "react";
import styles from "./GenericDropdown.module.scss";
import { headerize } from "./utils";

interface Props {
  children: React.ReactNode;
  columnName: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, columnName: string) => void;
  onClickDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, columnName: string) => void;
  initialState?: boolean;
  initialWidth?: string | undefined;
}

export function TableHeaderCell({
  children,
  columnName,
  initialState,
  initialWidth,
  onClick,
  onClickDelete,
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
      {headerize(columnName)}
      <button style={{ backgroundColor: "transparent" }} onClick={((e) => onClick(e, columnName))}>
        <span
          onClick={() => setSortState(!sortState)}
          className={`${"material-symbols-outlined"} black`}
        >
          {!sortState ? "expand_more" : "expand_less"}
        </span>
      </button>
      <button style={{ backgroundColor: "transparent" }} onClick={((e) => onClickDelete(e, columnName))}>
        <span style={{ fontSize: "12px" }}
          className={`${"material-symbols-outlined"} black`}
        >
          delete
        </span>
      </button>
      {children}
    </div>
  );
}

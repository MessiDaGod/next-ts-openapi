import { useRef } from "react";
import styles from "./GenericDropdown.module.scss";

interface Props {
  children: React.ReactNode;
  columnName: string;
  rowIndex: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export function TableBodyCell({ columnName, rowIndex, children, onClick }: Props) {
  return (
    <div
      key={`${columnName}_${rowIndex}`}
      className={styles["td"]}
      data-column-id={columnName}
      style={{ width: "50px" }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

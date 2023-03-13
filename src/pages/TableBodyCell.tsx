import { useRef } from "react";
import styles from "./GenericDropdown.module.scss";

interface Props {
  children: React.ReactNode;
  columnName: string;
  rowIndex: number;
}

export function TableBodyCell({ columnName, rowIndex, children }: Props) {
  const cellRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      key={`${columnName}_${rowIndex}`}
      className={styles["td"]}
      data-column-id={columnName}
      style={{ width: "100px" }}
      ref={cellRef}
    >
      {children}
    </div>
  );
}

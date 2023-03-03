import React from "react";
import styles from "./DynamicGrid.module.scss";

interface Props {
    sort: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function Sort({ onClick }: Props) {
  const [sortState, setSortState] = React.useState<boolean>(true);

  return (
    <span className={`${"material-symbols-outlined"} ${styles["black"]}`} onClick={onClick}>
      {!sortState ? "expand_more" : "expand_less"}
    </span>
  );
}

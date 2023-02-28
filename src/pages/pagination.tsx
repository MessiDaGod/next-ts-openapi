import React, { CSSProperties } from "react";
import styles from "./DataGridDropdown.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  id: string;
  style?: CSSProperties;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  id,
  style,
}: PaginationProps) {
  const [showChevrons, setShowChevrons] = React.useState<boolean>(true);

  React.useEffect(() => {
    setShowChevrons(totalPages > 10);
  }, [totalPages]);

  let pageNumbers: Array<number>;
  if (totalPages > 10) {
    if (currentPage < 6) {
      pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } else if (currentPage > totalPages - 5) {
      pageNumbers = [
        totalPages - 9,
        totalPages - 8,
        totalPages - 7,
        totalPages - 6,
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pageNumbers = [
        currentPage - 4,
        currentPage - 3,
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
        currentPage + 3,
        currentPage + 4,
        currentPage + 5,
      ];
    }
  } else {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  }

  return totalPages > 1 ? (
    <div
    id={id}
      className={styles["paginationDiv"]}
      style={style}
    >
      <div
        className={styles["tr"]}
        style={{
          height: "50px",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {pageNumbers.map(
          (pageNumber) =>
            pageNumber === 1 && (
              <p key={currentPage}>
                Page <br />{currentPage}of {totalPages}&nbsp;
              </p>
            )
        )}
        {showChevrons && (
          <div
            className={styles["td"]}
            style={{ height: "100%", borderColor: "transparent" }}
          >
            <span
              className={`material-symbols-outlined ${styles["page-button"]}`}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              chevron_left
            </span>
          </div>
        )}
        {pageNumbers.map((pageNumber) => (
          <button
            id={`button${pageNumber}`}
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`${
              pageNumber === currentPage ? styles.active : styles.button
            } ${styles["td"]}`}
            style={{ color: "white", width: "auto", display: "flex" }}
          >
            {pageNumber}
          </button>
        ))}

        {showChevrons && (
          <div className={styles["td"]} style={{ height: "100%" }}>
            <span
              className={`material-symbols-outlined ${styles["page-button"]}`}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              chevron_right
            </span>
          </div>
        )}
      </div>
    </div>
  ) : null;
}

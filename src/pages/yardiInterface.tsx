import React from "react";
import ReactDOM from "react-dom/client";
import styles from "../styles/yardiInterface.module.scss";

function YardiInterface() {
  return (
    <div style={{ overflow: "auto" }}>
      <div className={styles["divTable"]} style={{ width: "900px" }}>
        <div className={styles["thead"]}>
          <div className={styles["tr"]}>
            <div className={styles["th"]} style={{ width: "150px" }}>
              firstName<div className={styles["resizer"]}></div>
            </div>
            <div className={styles["th"]} style={{ width: "150px" }}>
              <span>Last Name</span>
              <div className={styles["resizer"]}></div>
            </div>
            <div className={styles["th"]} style={{ width: "150px" }}>
              Age<div className={styles["resizer"]}></div>
            </div>
            <div className={styles["th"]} style={{ width: "150px" }}>
              <span>Visits</span>
              <div className={styles["resizer"]}></div>
            </div>
            <div className={styles["th"]} style={{ width: "150px" }}>
              Status<div className={styles["resizer"]}></div>
            </div>
            <div className={styles["th"]} style={{ width: "150px" }}>
              Profile Progress<div className={styles["resizer"]}></div>
            </div>
          </div>
        </div>
        <div className={styles["tbody"]}>
          <div className={styles["tr"]}>
            <div className={styles["td"]} style={{ width: "150px" }}>
              tanner
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              linsley
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              24
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              100
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              In Relationship
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              50
            </div>
          </div>
          <div className={styles["tr"]}>
            <div className={styles["td"]} style={{ width: "150px" }}>
              tandy
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              miller
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              40
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              40
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              Single
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              80
            </div>
          </div>
          <div className={styles["tr"]}>
            <div className={styles["td"]} style={{ width: "150px" }}>
              joe
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              dirte
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              45
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              20
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              Complicated
            </div>
            <div className={styles["td"]} style={{ width: "150px" }}>
              10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YardiInterface;

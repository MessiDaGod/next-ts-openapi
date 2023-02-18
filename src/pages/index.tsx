import styles from "@/styles/Home.module.scss";
import { DataGrid } from "./dataGrid";

export default function Home() {
  return (
    <div className={styles["rz-layout"]}>
      <div className={styles["rz-body"]}>
        <main className={styles.main}>
          {DataGrid()}
        </main>
      </div>
    </div>
  );
}

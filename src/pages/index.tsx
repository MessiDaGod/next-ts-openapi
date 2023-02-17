import styles from "@/styles/Home.module.css";
import { DataGrid } from "./dataGrid";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        {DataGrid()}
      </main>
    </div>
  );
}

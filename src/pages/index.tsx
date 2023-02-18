import styles from "@/styles/Home.module.css";
import { DataGrid } from "./dataGrid";
import Sidebar from "./sidebar";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
      <Sidebar />
      {DataGrid()}
      </main>
    </div>
  );
}

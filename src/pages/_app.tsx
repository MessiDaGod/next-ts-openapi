import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import styles from "./TopBar.module.css";
import Dropdown from './dropdown';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <div className={styles["topbar"]}>
        <div className={styles.logo}></div>
        <div className={styles["linksContainer"]}>
          <Link className={styles["links"]} href="/">
            Home
          </Link>
          <Link className={styles["links"]} href="/Register">
            Register
          </Link>
          <Link className={styles["links"]} href="/CodeEditor">
            Code Editor
          </Link>
        </div>
        <Dropdown jsonFileName="data" />
      </div>
      <Component {...pageProps} />
    </div>
  );
}

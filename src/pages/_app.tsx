import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import styles from "@/styles/Home.module.scss";
import ConnectionDropdown from "./connectionDropdown";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { cn } from "../classNames";
import { useRouter } from "next/router";
import classnames from "classnames";

interface SidebarItem {
  Name: string;
  Path: string;
  Icon: string;
  New?: boolean;
  Updated?: boolean;
}

interface TopBar {
  id: string;
  label: string;
  url: string;
}
interface Menu {
  sidebarItems: SidebarItem[];
  topBar: TopBar[];
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      search();
      fetch("/menu.json")
        .then((response) => response.json())
        .then((data) => setMenu(data));
    }
    fetchData();
  }, []);

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  function goHome(): void {
    router.push("/");
  }

  function search(): void {
    const searchInput = document.querySelector("#search-input");
    searchInput.addEventListener("input", handleSearchInput);

    function handleSearchInput() {
      const sidebarItems = document.querySelectorAll(
        `.${classnames(styles["sidebar__item"])}`
      ) as NodeListOf<HTMLElement>;
      let input = searchInput as HTMLInputElement;
      const query = input.value.toLowerCase();

      for (const item of sidebarItems) {
        if (item) {
          let newItem = item as HTMLElement;
          if (newItem) {
            const title = newItem
              .dataset.columnId.toLowerCase();
            if (title.includes(query)) {
              item.style.display = "block";
            } else {
              item.style.display = "none";
            }
          }
        }
      }
    }
  }

  return (
    <>
      <Head>
        <title>Next App</title>
        <style>{`
    :root {
      --bg-color: #0d1117;
    }
    body {
      background-color: var(--bg-color);
    }
  `}</style>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/dog.png" />
      </Head>
      <>
        <div
          className={styles["dropdown"]}
          style={{ position: "relative", display: "inline-block" }}
        >
          <button
            className={`${styles["expandButton"]} ${
              collapsed ? styles.collapsed : styles.expanded
            }`}
            onClick={handleCollapse}
          >
            {
              <span
                className="material-symbols-outlined"
                style={{ paddingLeft: "2px" }}
              >
                menu
              </span>
            }
          </button>
        </div>
        <nav
          className={`${styles["sidebar"]} ${
            collapsed ? styles.collapsed : styles.expanded
          }`}
        >
          <div>
            <input
              id="search-input"
              type="search"
              className="rz-textbox findcomponent"
              placeholder="Find component ..."
              autoComplete="on"
              style={{
                padding: "1rem",
                color: "white",
                backgroundColor: "inherit",
                fontSize: "16px",
                borderBottom: "1px solid #2f333d",
                borderTop: "1px solid #2f333d",
                width: "100%",
                cursor: "pointer",
              }}
            ></input>
          </div>
          <div className={styles["ul"]}>
            {menu?.sidebarItems.map((item, index: number) => (
              <a
                key={index}
                className={styles["sidebar__item"]}
                href={item.Path}
                data-column-id={item.Name}
                style={{
                  fontSize: "16px",
                  borderBottom: "1px solid #2f333d",
                  borderTop: "1px solid #2f333d",
                  width: "100%",
                }}
              >
                <span className="material-symbols-outlined">{item.Icon}</span>
                {item.Name}
              </a>
            ))}
          </div>
        </nav>
      </>
      <div className={styles["topbar"]}>
        <a
          type="button"
          className={styles.sitelogo}
          onClick={() => goHome()}
          style={{
            justifyContent: "flex-start",
            paddingRight: "50px",
            width: "100%",
            borderStyle: "none",
            borderColor: "transparent"
          }}
        >
          <span
            style={{
              fontSize: "24px",
              userSelect: "none",
              cursor: "pointer",
              marginLeft: "10px",
              marginTop: "10px",
            }}
          >
            Shakely Consulting
          </span>
        </a>
        <div className={styles["linksContainer"]}>
          <ConnectionDropdown jsonFileName="connections" label="Connections" />
          {menu?.topBar.map((item, index: number) => (
            <Link
              key={`${item}_${index}`}
              className={styles["links"]}
              href={item.url}
              style={{ marginRight: "1rem" }}
              title={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div
        className={cn(
          styles["rz-body"],
          styles["body"],
          collapsed ? styles["rz-body-collapsed"] : styles["rz-body"]
        )}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
}

import Link from "next/link";
import styles from "./Home.module.scss";
import ConnectionDropdown from "./connectionDropdown";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ga } from "../utils/analytics";
import cn from "classnames";
import "styles/globals.css";
import "../styles/algolia.css";
import "../styles/index.css";
import "../styles/sandpack.css";
import Menu from "../../public/menu.json";

// if (typeof window !== "undefined") {
//   if (process.env.NODE_ENV === "production") {
//     ga("create", process.env.NEXT_PUBLIC_GA_TRACKING_ID, "auto");
//   }
//   const terminationEvent = "onpagehide" in window ? "pagehide" : "unload";
//   window.addEventListener(terminationEvent, function () {
//     ga("send", "timing", "JS Dependencies", "unload");
//   });
// }

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
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState<Menu>();

  function isMobile() {
    if (typeof window === "undefined") {
      return false; // or throw an error, depending on your use case
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      "android",
      "iphone",
      "ipod",
      "ipad",
      "mobile",
      "tablet",
    ];

    for (let i = 0; i < mobileKeywords.length; i++) {
      if (userAgent.indexOf(mobileKeywords[i]) !== -1) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
    async function fetchData() {
      // Taken from StackOverflow. Trying to detect both Safari desktop and mobile.
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      if (isSafari) {
        // console.log(isSafari);
        // This is kind of a lie.
        // We still rely on the manual Next.js scrollRestoration logic.
        // However, we *also* don't want Safari grey screen during the back swipe gesture.
        // Seems like it doesn't hurt to enable auto restore *and* Next.js logic at the same time.
        history.scrollRestoration = "auto";
      } else {
        // For other browsers, let Next.js set scrollRestoration to 'manual'.
        // It seems to work better for Chrome and Firefox which don't animate the back swipe.
      }
      search();
      setMenu(Menu);
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
    searchInput?.addEventListener("input", handleSearchInput);

    function handleSearchInput() {
      const sidebarItems = document.querySelectorAll(
        `.${cn(styles["sidebar__item"])}`
      ) as NodeListOf<HTMLElement>;
      let input = searchInput as HTMLInputElement;
      const query = input.value.toLowerCase();

      for (const item of sidebarItems) {
        if (item) {
          let newItem = item as HTMLElement;
          if (newItem && newItem.dataset.columnId) {
            const title = newItem.dataset.columnId.toString().toLowerCase();
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

  const type = isMobile() ? (
    <span className="material-symbols-outlined">phone_iphone</span>
  ) : (
    <span className="material-symbols-outlined">computer</span>
  );

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
        <link rel="icon" href="/favicon.ico" />
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
                style={{ marginLeft: "10px" }}
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
            borderStyle: "none",
            borderColor: "transparent",
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
          <Link
            key={"isMobile"}
            children={type}
            href=""
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: "1rem",
              alignItems: "center",
              verticalAlign: "middle",
            }}
          ></Link>
          {menu?.topBar.map((item, index: number) => (
            <Link
              key={`${item}_${index}`}
              className={styles["links"]}
              href={item.url}
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginRight: "1rem",
              }}
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

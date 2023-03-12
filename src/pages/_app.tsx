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
// import "../styles/index.css";
import "../styles/sandpack.css";
import Menu from "../../public/menu.json";
import Script from "next/script";
import { Log } from "./utils";

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
  const [hasNotifications, setHasNotifications] = useState(false);

  function isMobile() {
    if (typeof window === "undefined") {
      return false; // or throw an error, depending on your use case
    }

    const listElem = (
      document.getElementById("notifications-popup") as HTMLElement
    ).querySelector("ul") as HTMLElement;
    const children = listElem.children;
    if (!children[0].textContent.includes(":(")) setHasNotifications(true);

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

  useEffect(() => {
    if (hasNotifications) {
      const notificationsIcon = document.getElementById("notifications-icon");
      notificationsIcon.style.color = "lime";
    }
  }, [hasNotifications]);

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
    <span className="material-symbols-outlined white">phone_iphone</span>
  ) : (
    <span className="material-symbols-outlined white">computer</span>
  );

  function handleNotifs(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    const notificationsIcon = document.getElementById("notifications-icon");
    const notificationsPopup = document.getElementById("notifications-popup");

    // Toggle the popup's visibility when the icon is clicked
    notificationsPopup.style.display =
      notificationsPopup.style.display === "none" ? "flex" : "none";

    notificationsPopup.style.placeContent = "flex-end";
    notificationsPopup.style.alignItems = "flex-end";

    // notificationsIcon.style.color =
    //   notificationsPopup.style.display === "none" ? "white" : "lime";
    // // Position the popup below and to the left of the icon
    // notificationsPopup.style.top = `${
    //   notificationsIcon.offsetTop + notificationsIcon.offsetHeight
    // }px`;
    // notificationsPopup.style.left = `${notificationsIcon.offsetLeft}px`;
  }

  if (typeof window !== "undefined") {
    // code that uses the document object goes here
    document.addEventListener("click", (event) => {
      const notificationsPopup = document.getElementById("notifications-popup");
      const targetNode = event.target as Node;
      if (notificationsPopup && !notificationsPopup.contains(targetNode)) {
        // hide the popup
      }
    });
  }

  function handleMarkAsRead(e) {
    const marIcon = e.target as HTMLElement;
    marIcon.style.transition = "200ms cubic-bezier(.4,0,.2,1) 0ms";
    marIcon.style.fill = "lime";
    const ul = document.getElementById("notifications-ul");
    ul.innerHTML = "";
    const li = document.createElement("li");
    li.innerHTML = "Nothing new :(";
    ul.appendChild(li);
    setTimeout(() => {
      marIcon.style.fill = "black";
    }, 1000);
  }

  function toffleNotifs(e) {
    if (typeof window !== "undefined") {
      const notificationsPopup = document.getElementById("notifications-popup");

      // Toggle the popup's visibility when the icon is clicked
      notificationsPopup.style.display =
        notificationsPopup.style.display === "none" ? "flex" : "none";

      notificationsPopup.style.placeContent = "flex-end";
      notificationsPopup.style.alignItems = "flex-end";
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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <span
        className={cn("material-symbols-outlined")}
        style={{
          paddingLeft: "10px",
          fill: hasNotifications ? "green" : "white",
          zIndex: 1000,
          order: 0,
          position: "fixed",
        }}
        onClick={handleCollapse}
      >
        menu
      </span>

        <span
          id="notifications-icon"
          className={cn("material-symbols-outlined", "white")}
          style={{
            paddingLeft: "10px",
            zIndex: 1000,
            top: "1rem",
            right: "1rem",
            order: 0,
            position: "fixed",
          }}
          onClick={handleNotifs}
        >
          notifications
        </span>
        <div id="notifications-popup" className="notifications-popup">
          <div
            id="popovercontent"
            className="mud-popover mud-popover-open mud-popover-top-left mud-popover-anchor-bottom-left mud-popover-overflow-flip-onopen mud-paper mud-elevation-8"
            style={{
              transitionDuration: "251ms",
              transitionDelay: "0ms",
              zIndex: "calc(var(--mud-zindex-popover) + 3)",
              right: "1rem",
              top: "50px",
              position: "fixed",
            }}
          >
            <div className="mud-list mud-list-padding">
              <div className="d-flex justify-space-between align-center px-2">
                <h6 className="mud-typography mud-typography-subtitle2">
                  Notifications
                </h6>
                <button
                  type="button"
                  className="mud-button-root mud-button mud-button-text mud-button-text-primary mud-button-text-size-medium mud-ripple ml-16 mr-n2 mud-text-white"
                >
                  <span className="mud-button-label">
                    <span className="mud-button-icon-start mud-button-icon-size-medium">
                      <svg
                        className="mud-icon-root mud-svg-icon mud-icon-size-medium"
                        focusable="false"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        onClick={handleMarkAsRead}
                      >
                        <path d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"></path>
                      </svg>
                    </span>
                    Mark as read
                  </span>
                </button>
              </div>
              <div
                id="nothingnew"
                className="d-flex justify-center align-center px-2 py-8 relative"
              >
                <h6 className="mud-typography mud-typography-subtitle2 mud-text-white my-12">
                  <ul
                    id="notifications-ul"
                    style={{
                      zIndex: 10000,
                    }}
                  >
                    <li>Nothing new :(</li>
                  </ul>
                </h6>
              </div>
            </div>
          </div>
        </div>


      <div style={{ display: "flex", flexDirection: "column" }}>
        <nav
          className={`${styles["sidebar"]} ${
            collapsed ? styles.collapsed : styles.expanded
          }`}
        >
          <input
            id="search-input"
            type="search"
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
              marginTop: "20px",
              order: 1,
            }}
          ></input>

          <div style={{ flexDirection: "row" }}>
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
          </div>
        </nav>
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

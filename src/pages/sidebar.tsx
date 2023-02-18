import { useEffect, useState } from "react";
import styles from '../styles/sidebar.module.scss'

interface SidebarItem {
  Name: string;
  Path: string;
  Icon: string;
  New?: boolean;
  Updated?: boolean;
}

interface Menu {
  topBar: { id: string; label: string; url: string }[];
  sideMenu: { id: string; label: string; url: string }[];
  sidebar: SidebarItem[];
}

function Sidebar() {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      const response = await fetch("/menu.json");
      const data = await response.json();
      setSidebarItems(data.sidebar);
    }

    fetchMenu();
  }, []);

  // Render the sidebar items
  return (
    <div
      className={`${styles.sidebar} ${
        isExpanded ? styles.expanded : styles.collapsed
      }`}
    >
      <button
        className={styles.expandButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`material-symbols-outlined ${styles.expandIcon}`}>menu</span>
      </button>
      <nav>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.Path} className={styles["sidebar__item"]}>
              <a href={item.Path}>
                <span className={`material-symbols-outlined ${styles.icon}`}>
                  {item.Icon}&nbsp;
                </span>
                {item.Name}
                {item.New && <span>New</span>}
                {item.Updated && <span>Updated</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;

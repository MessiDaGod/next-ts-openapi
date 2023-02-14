import React from 'react';
import styles from './TopBar.module.css';
import Dropdown from './dropdown';
import Link from 'next/link';

const TopBar = () => {
  return (
    <div className={styles.topbar}>
      <div className={styles.logo}>
      </div>
      <div className={styles.links}>
        <Link href="/">Home</Link>
        <Link href="/">Features</Link>
        <Link href="/">Pricing</Link>
      </div>
      <Dropdown jsonFileName="data" />
    </div>
  );
};

export default TopBar;

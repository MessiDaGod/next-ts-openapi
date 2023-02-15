import React from 'react';
import styles from './TopBar.module.css';
import Dropdown from './dropdown';
import Link from 'next/link';

const TopBar = () => {
  return (
    <div className={styles['topbar']}>
      <div className={styles.logo}>
      </div>
      <div className={styles['linksContainer']} >
        <Link className={styles['links']} href="/">Home</Link>
        <Link className={styles['links']} href="/">Features</Link>
        <Link className={styles['links']} href="/">Pricing</Link>
      </div>
      <Dropdown jsonFileName="data" />
    </div>
  );
};

export default TopBar;

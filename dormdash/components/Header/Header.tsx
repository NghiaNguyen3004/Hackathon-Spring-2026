"use client";

import styles from "./Header.module.css";
import HeaderUser from "./HeaderUser";

export default function Header() {
  return (
    <header className={styles.header}>
      {/* LEFT: Logo */}
      <div className={styles.left}>
        <h1 className={styles.logo}>DORMDASH</h1>
      </div>

      {/* RIGHT: User info */}
      <div className={styles.right}>
        <span className={styles.greeting}>
          <HeaderUser />
        </span>

        <div className={styles.avatar} />
      </div>
    </header>
  );
}
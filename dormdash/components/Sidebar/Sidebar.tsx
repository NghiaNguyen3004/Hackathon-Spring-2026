import Link from "next/link";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Menu</h2>

      <nav className={styles.nav}>
        <Link href="/post" className={styles.active}>
          Post Page
        </Link>

        <Link href="/myposts" className={styles.item}>
          My Posts
        </Link>

        <Link href="/requests" className={styles.item}>
          Requests
        </Link>

        <Link href="/messages" className={styles.item}>
          Messages
        </Link>

        <Link href="/profile" className={styles.item}>
          Profile
        </Link>
      </nav>
    </aside>
  );
}
import AppShell from "@/components/Layout/AppShell";
import PostCard from "@/components/PostCard/PostCard";
import styles from "./PostPage.module.css";
import RequestList from "@/components/RequestList/RequestList";

export default function PostPage() {
  return (
    <AppShell username="Ngoc">
      <div className={styles.wrapper}>
        <div className={styles.headerRow}>
          <h2 className={styles.pageTitle}>Community Posts</h2>
          <input
            type="text"
            placeholder="Search posts..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.feed}>
            <RequestList/>
        </div>
      </div>
    </AppShell>
  );
}
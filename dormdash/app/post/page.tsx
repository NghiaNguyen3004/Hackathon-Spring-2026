import AppShell from "@/components/Layout/AppShell";
import PostCard from "@/components/PostCard/PostCard";
import styles from "./PostPage.module.css";

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
          <PostCard
            username="Nghia"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          />

          <PostCard
            username="Evelyn"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          />
        </div>
      </div>
    </AppShell>
  );
}
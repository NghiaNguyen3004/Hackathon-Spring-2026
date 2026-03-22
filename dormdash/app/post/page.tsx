"use client";
import AppShell from "@/components/Layout/AppShell";
import PostCard from "@/components/PostCard/PostCard";
import styles from "./PostPage.module.css";
import RequestModal from "@/components/RequestModal/RequestModal";
import { useState } from "react";

export default function PostPage() {
  const [show, setShow] = useState(false);

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
          
        </div>

        
      </div>
    </AppShell>
  );
}


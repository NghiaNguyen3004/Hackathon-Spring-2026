"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/Layout/AppShell";
import styles from "./PostPage.module.css";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Post = {
  id: string;
  title: string;
  description: string;
  authorUsername: string;
};

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Post[] = snapshot.docs.map((doc) => {
        const value = doc.data() as Omit<Post, "id">;
        return {
          id: doc.id,
          ...value,
        };
      });

      setPosts(data);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPost = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must log in first.");
      return;
    }

    const title = window.prompt("Enter post title:");
    if (!title || !title.trim()) return;

    const description = window.prompt("Enter post description:") || "";

    try {
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        description: description.trim(),
        authorId: user.uid,
        authorUsername: user.displayName || user.email || "Unknown User",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to add post.");
    }
  };

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
          {posts.length === 0 ? (
            <>
              <div className={styles.card}>
                <h3 className={styles.title}>
                  Need help cleaning my dorm room
                </h3>
                <p className={styles.description}>
                  Looking for someone to help vacuum and organize my room tonight.
                </p>
              </div>

              <div className={styles.card}>
                <h3 className={styles.title}>Take out trash and boxes</h3>
                <p className={styles.description}>
                  Need someone to help throw away old boxes and trash bags.
                </p>
              </div>
            </>
          ) : (
            posts.map((post) => (
              <div key={post.id} className={styles.card}>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.description}>{post.description}</p>
                <p className={styles.meta}>Posted by {post.authorUsername}</p>
              </div>
            ))
          )}
        </div>

        <button className={styles.fab} onClick={handleAddPost}>
          +
        </button>
      </div>
    </AppShell>
  );
}
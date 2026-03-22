"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/Layout/AppShell";
import styles from "./ProfilePage.module.css";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

type Post = {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorUsername: string;
};

export default function ProfilePage() {
  const [openSection, setOpenSection] = useState<"pending" | "assigned" | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);

  const user = auth.currentUser;

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

      if (user) {
        const filtered = data.filter((post) => post.authorId === user.uid);
        setMyPosts(filtered);
      } else {
        setMyPosts([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AppShell username="Ngoc">
      <div className={styles.wrapper}>
        <h1 className={styles.pageTitle}>Profile</h1>

        <div className={styles.content}>
          <div className={styles.profileCard}>
            <div className={styles.avatar} />

            <h2 className={styles.username}>
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </h2>

            <p className={styles.email}>{user?.email || "No email"}</p>

            <p className={styles.bio}>User Bio</p>

            <button className={styles.editButton}>Edit Profile</button>
          </div>

          <div className={styles.rightPanel}>
            <button
              className={styles.dropdownButton}
              onClick={() =>
                setOpenSection(openSection === "pending" ? null : "pending")
              }
            >
              My Posts
              <span>▼</span>
            </button>

            {openSection === "pending" && (
              <div className={styles.dropdownContent}>
                {myPosts.length === 0 ? (
                  <p className={styles.emptyTextDark}>You have not posted anything yet.</p>
                ) : (
                  <div className={styles.myPostsList}>
                    {myPosts.map((post) => (
                      <div key={post.id} className={styles.myPostItem}>
                        <p className={styles.myPostTitle}>{post.title}</p>
                        {post.description ? (
                          <p className={styles.myPostDesc}>{post.description}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              className={styles.dropdownButton}
              onClick={() =>
                setOpenSection(openSection === "assigned" ? null : "assigned")
              }
            >
              Assigned Requests
              <span>▼</span>
            </button>

            {openSection === "assigned" && (
              <div className={styles.dropdownContent}>
                <p className={styles.emptyTextDark}>No assigned requests yet.</p>
              </div>
            )}

            <button className={styles.requestButton}>Request New Help</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
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
  status?: "open" | "assigned";
  acceptedById?: string | null;
  acceptedByUsername?: string | null;
};

export default function ProfilePage() {
  const [openSection, setOpenSection] = useState<"myposts" | "assigned" | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<Post[]>([]);

  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Post[] = snapshot.docs.map((docSnap) => {
        const value = docSnap.data() as Omit<Post, "id">;
        return {
          id: docSnap.id,
          ...value,
        };
      });

      if (user) {
        const filteredMyPosts = data.filter((post) => post.authorId === user.uid);
        const filteredAssigned = data.filter((post) => post.acceptedById === user.uid);

        setMyPosts(filteredMyPosts);
        setAssignedRequests(filteredAssigned);
      } else {
        setMyPosts([]);
        setAssignedRequests([]);
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
                setOpenSection(openSection === "myposts" ? null : "myposts")
              }
            >
              My Posts
              <span>▼</span>
            </button>

            {openSection === "myposts" && (
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

                        <p
                          className={
                            post.acceptedByUsername
                              ? styles.postStatusAccepted
                              : styles.postStatusPending
                          }
                        >
                          {post.acceptedByUsername
                            ? `Accepted by ${post.acceptedByUsername}`
                            : "Pending"}
                        </p>
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
                {assignedRequests.length === 0 ? (
                  <p className={styles.emptyTextDark}>No assigned requests yet.</p>
                ) : (
                  <div className={styles.myPostsList}>
                    {assignedRequests.map((post) => (
                      <div key={post.id} className={styles.myPostItem}>
                        <p className={styles.myPostTitle}>{post.title}</p>

                        {post.description ? (
                          <p className={styles.myPostDesc}>{post.description}</p>
                        ) : null}

                        <p className={styles.myPostDesc}>
                          Posted by {post.authorUsername}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  );
}
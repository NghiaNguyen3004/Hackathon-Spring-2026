"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/Layout/AppShell";
import styles from "./PostPage.module.css";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  where,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Post = {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorUsername: string;
  status?: "open" | "assigned";
  acceptedById?: string | null;
  acceptedByUsername?: string | null;
  ignoredBy?: string[];
};

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

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
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const username = userSnap.exists()
        ? userSnap.data().username || "Unknown User"
        : "Unknown User";

      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        description: description.trim(),
        authorId: user.uid,
        authorUsername: username,
        createdAt: serverTimestamp(),
        status: "open",
        acceptedById: null,
        acceptedByUsername: null,
        ignoredBy: [],
      });
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to add post.");
    }
  };

  const handleAccept = async (post: Post) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must log in first.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const username = userSnap.exists()
        ? userSnap.data().username || "Unknown User"
        : "Unknown User";

      await updateDoc(doc(db, "posts", post.id), {
        status: "assigned",
        acceptedById: user.uid,
        acceptedByUsername: username,
      });
    } catch (error) {
      console.error("Error accepting post:", error);
      alert("Failed to accept request.");
    }
  };

  const handleIgnore = async (post: Post) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must log in first.");
      return;
    }

    try {
      await updateDoc(doc(db, "posts", post.id), {
        ignoredBy: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Error ignoring post:", error);
      alert("Failed to ignore post.");
    }
  };

  const handleMessage = async (post: Post) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must log in first.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const myUsername = userSnap.exists()
        ? userSnap.data().username || "Unknown User"
        : "Unknown User";

      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("members", "array-contains", user.uid));
      const snapshot = await getDocs(q);

      let existingChatId: string | null = null;

      snapshot.forEach((chatDoc) => {
        const data = chatDoc.data();
        if (
          Array.isArray(data.members) &&
          data.members.includes(post.authorId) &&
          data.members.length === 2
        ) {
          existingChatId = chatDoc.id;
        }
      });

      if (!existingChatId) {
        const newChat = await addDoc(chatsRef, {
          members: [user.uid, post.authorId],
          memberNames: [myUsername, post.authorUsername],
          createdAt: serverTimestamp(),
        });

        existingChatId = newChat.id;
      }

      router.push(`/messages?chatId=${existingChatId}`);
    } catch (error) {
      console.error("Error opening chat:", error);
      alert("Failed to open chat.");
    }
  };

  const currentUser = auth.currentUser;

  const communityPosts = posts.filter((post) => {
    if (!currentUser) return false;

    const ignoredBy = post.ignoredBy || [];

    return (
      post.authorId !== currentUser.uid &&
      (post.status || "open") === "open" &&
      !ignoredBy.includes(currentUser.uid)
    );
  });

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
          {communityPosts.length === 0 ? (
            <p>No community posts yet.</p>
          ) : (
            communityPosts.map((post) => (
              <div key={post.id} className={styles.card}>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.description}>{post.description}</p>
                <p className={styles.meta}>Posted by {post.authorUsername}</p>

                <div className={styles.cardActions}>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleAccept(post)}
                  >
                    Accept
                  </button>

                  <button
                    className={styles.ignoreBtn}
                    onClick={() => handleIgnore(post)}
                  >
                    Ignore
                  </button>

                  <button
                    className={styles.messageBtn}
                    onClick={() => handleMessage(post)}
                  >
                    Message
                  </button>
                </div>
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
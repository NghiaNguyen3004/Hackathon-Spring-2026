"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/Layout/AppShell";
import RequestModal from "@/components/RequestModal/RequestModal";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
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

  const openAddModal = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must log in first.");
      return;
    }

    setNewTitle("");
    setNewDescription("");
    setIsAddModalOpen(true);
  };

  const handleSubmitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("You must log in first.");
      return;
    }

    if (!newTitle.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        title: newTitle.trim(),
        description: newDescription.trim(),
        authorId: user.uid,
        authorUsername: user.displayName || user.email || "Unknown User",
        createdAt: serverTimestamp(),
        status: "open",
        acceptedById: null,
        acceptedByUsername: null,
        ignoredBy: [],
      });

      setIsAddModalOpen(false);
      setNewTitle("");
      setNewDescription("");
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
      await updateDoc(doc(db, "posts", post.id), {
        status: "assigned",
        acceptedById: user.uid,
        acceptedByUsername: user.displayName || user.email || "Unknown User",
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
          memberNames: [
            user.displayName || user.email || "Unknown User",
            post.authorUsername || "Unknown User",
          ],
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

        <div>
          <button className={styles.fab} onClick={openAddModal}>
          +
        </button>
        </div>
        <RequestModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="create-request-title">
            <h3 id="create-request-title" className={styles.modalTitle}>
              Create a Request
            </h3>

            <form onSubmit={handleSubmitPost} className={styles.modalForm}>
              <input
                type="text"
                placeholder="Request title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className={styles.modalInput}
                autoFocus
              />

              <textarea
                placeholder="Request description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                className={styles.modalTextarea}
                rows={4}
              />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Post
                </button>
              </div>
            </form>
          </div>
        </RequestModal>

        
      </div>
    </AppShell>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/Layout/AppShell";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

type UserType = {
  uid: string;
  username: string;
  email?: string;
};

type ConversationType = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: { seconds?: number };
};

type MessageType = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: { seconds?: number };
};

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [searchText, setSearchText] = useState("");

  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Load current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        return;
      }

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setCurrentUser({
            uid: data.uid || snap.id,
            username: data.username || "User",
            email: data.email || "",
          });
        } else {
          setCurrentUser({
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
          });
        }
      } catch (err) {
        console.error("Load current user error:", err);
      }
    });

    return () => unsub();
  }, []);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const users = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            uid: data.uid || docSnap.id,
            username: data.username || "",
            email: data.email || "",
          };
        }) as UserType[];

        setAllUsers(users);
      } catch (err) {
        console.error("Load users error:", err);
      }
    };

    loadUsers();
  }, []);

  // Load conversations of current user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ConversationType[];

      list.sort((a, b) => {
        const aTime = a.lastMessageAt?.seconds || 0;
        const bTime = b.lastMessageAt?.seconds || 0;
        return bTime - aTime;
      });

      setConversations(list);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // Load messages of selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "conversations", selectedConversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MessageType[];

      setMessages(list);
    });

    return () => unsub();
  }, [selectedConversationId]);

  // Search results only show when typing
  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword || !currentUser) return [];

    return allUsers.filter((user) => {
      if (user.uid === currentUser.uid) return false;

      return (
        user.username.toLowerCase().includes(keyword) ||
        (user.email || "").toLowerCase().includes(keyword)
      );
    });
  }, [allUsers, currentUser, searchText]);

  const findUserByUid = (uid: string) => {
    return allUsers.find((u) => u.uid === uid) || null;
  };

  const handleSelectConversation = (conversation: ConversationType) => {
    if (!currentUser) return;

    const otherUid = conversation.participants.find((uid) => uid !== currentUser.uid);
    if (!otherUid) return;

    const otherUser = findUserByUid(otherUid);
    if (!otherUser) return;

    setSelectedUser(otherUser);
    setSelectedConversationId(conversation.id);
  };

  const handleSelectUser = async (user: UserType) => {
    if (!currentUser) return;

    const existing = conversations.find((conv) => {
      if (conv.participants.length !== 2) return false;
      return (
        conv.participants.includes(currentUser.uid) &&
        conv.participants.includes(user.uid)
      );
    });

    if (existing) {
      setSelectedUser(user);
      setSelectedConversationId(existing.id);
      setSearchText("");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "conversations"), {
        participants: [currentUser.uid, user.uid],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
      });

      setSelectedUser(user);
      setSelectedConversationId(docRef.id);
      setSearchText("");
    } catch (err) {
      console.error("Create conversation error:", err);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversationId || !currentUser || isSending) {
      return;
    }

    const text = messageInput.trim();
    setIsSending(true);

    try {
      await addDoc(
        collection(db, "conversations", selectedConversationId, "messages"),
        {
          senderId: currentUser.uid,
          text,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(doc(db, "conversations", selectedConversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      });

      setMessageInput("");
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppShell username={currentUser?.username || "Guest"}>
      <div
        style={{
          padding: 24,
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 20,
          height: "80vh",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
            overflow: "auto",
          }}
        >
          <h2 style={{ marginBottom: 16 }}>Messages</h2>

          <input
            type="text"
            placeholder="Search username..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #ccc",
              borderRadius: 10,
              marginBottom: 16,
            }}
          />

          {searchText.trim() !== "" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                Search results
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.uid}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      style={{
                        textAlign: "left",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 12,
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{user.username}</div>
                      <div style={{ fontSize: 14, opacity: 0.7 }}>{user.email}</div>
                    </button>
                  ))
                ) : (
                  <div>No users found.</div>
                )}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              Existing chats
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const otherUid = conversation.participants.find(
                    (uid) => uid !== currentUser?.uid
                  );
                  const otherUser = otherUid ? findUserByUid(otherUid) : null;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation)}
                      style={{
                        textAlign: "left",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 12,
                        background:
                          selectedConversationId === conversation.id
                            ? "#f4a4a0ff"
                            : "white",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {otherUser?.username || "Unknown User"}
                      </div>
                      <div style={{ fontSize: 14, opacity: 0.7 }}>
                        {conversation.lastMessage || "No messages yet"}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div>No chats yet.</div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {selectedUser ? (
            <>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #eee",
                  fontWeight: 700,
                }}
              >
                Chat with {selectedUser.username}
              </div>

              <div
                style={{
                  flex: 1,
                  padding: 16,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUser?.uid;

                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          background: isMine ? "#f34040ff" : "#f3f4f6",
                          color: isMine ? "white" : "black",
                          padding: "10px 14px",
                          borderRadius: 12,
                          maxWidth: "70%",
                        }}
                      >
                        {msg.text}
                      </div>
                    );
                  })
                ) : (
                  <div>No messages yet.</div>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  padding: 16,
                  display: "flex",
                  gap: 10,
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSending) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    border: "1px solid #ccc",
                    borderRadius: 10,
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "none",
                    cursor: isSending ? "not-allowed" : "pointer",
                    opacity: isSending ? 0.6 : 1,
                  }}
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: 24 }}>Search or select an existing chat.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
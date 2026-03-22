"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/Layout/AppShell";
import styles from "./messages.module.css";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getOrCreateChat, searchUsersByUsername, sendMessage } from "@/lib/chat";

type UserType = {
  uid: string;
  usernames: string;
  email?: string;
  fullName?: string;
};

type ChatType = {
  id: string;
  participants: string[];
  participantUsernames?: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  lastMessageSenderId?: string;
};

type MessageType = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);

  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [chatUserMap, setChatUserMap] = useState<Record<string, UserType>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setCurrentUser(snap.data() as UserType);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ChatType[];

      chatList.sort((a, b) => {
        const aTime = a.lastMessageAt?.seconds || 0;
        const bTime = b.lastMessageAt?.seconds || 0;
        return bTime - aTime;
      });

      setChats(chatList);

      const userMap: Record<string, UserType> = {};

      for (const chat of chatList) {
        const otherUid = chat.participants.find((id) => id !== currentUser.uid);
        if (!otherUid) continue;

        const otherRef = doc(db, "users", otherUid);
        const otherSnap = await getDoc(otherRef);

        if (otherSnap.exists()) {
          userMap[chat.id] = otherSnap.data() as UserType;
        }
      }

      setChatUserMap(userMap);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedChat?.id) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "chats", selectedChat.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MessageType[];

      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const handleSearchUsers = async () => {
    if (!currentUser?.uid) return;
    const results = await searchUsersByUsername(searchText, currentUser.uid);
    setSearchResults(results as UserType[]);
  };

  const handleSelectUserFromSearch = async (user: UserType) => {
    if (!currentUser) return;

    const chat = await getOrCreateChat(currentUser, user);
    setSelectedChat(chat as ChatType);

    setSearchResults([]);
    setSearchText("");
  };

  const handleOpenChat = (chat: ChatType) => {
    setSelectedChat(chat);
  };

  const handleSend = async () => {
    if (!selectedChat || !currentUser || !messageInput.trim()) return;
    await sendMessage(selectedChat.id, currentUser.uid, messageInput);
    setMessageInput("");
  };

  const selectedOtherUser = useMemo(() => {
    if (!selectedChat || !currentUser) return null;
    return chatUserMap[selectedChat.id] || null;
  }, [selectedChat, currentUser, chatUserMap]);

  return (
    <AppShell username={currentUser?.usernames || "Guest"}>
      <div className={styles.wrapper}>
        {!selectedChat ? (
          <>
            <div className={styles.headerRow}>
              <h2 className={styles.pageTitle}>Messages</h2>

              <div className={styles.searchBarWrap}>
                <input
                  type="text"
                  placeholder="Search username..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className={styles.searchInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchUsers();
                  }}
                />
                <button className={styles.searchButton} onClick={handleSearchUsers}>
                  Search
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className={styles.searchResultsBox}>
                {searchResults.map((user) => (
                  <div
                    key={user.uid}
                    className={styles.searchResultItem}
                    onClick={() => handleSelectUserFromSearch(user)}
                  >
                    <div className={styles.avatar}>
                      {user.usernames?.[0]?.toUpperCase() || "U"}
                    </div>

                    <div className={styles.resultInfo}>
                      <div className={styles.resultName}>{user.usernames}</div>
                      <div className={styles.resultSub}>{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.chatListCard}>
              {chats.length === 0 ? (
                <div className={styles.emptyState}>
                  No chats yet. Search a username above to start chatting.
                </div>
              ) : (
                chats.map((chat) => {
                  const otherUser = chatUserMap[chat.id];

                  return (
                    <div
                      key={chat.id}
                      className={styles.chatPreview}
                      onClick={() => handleOpenChat(chat)}
                    >
                      <div className={styles.avatar}>
                        {otherUser?.usernames?.[0]?.toUpperCase() || "U"}
                      </div>

                      <div className={styles.chatPreviewContent}>
                        <div className={styles.chatPreviewTopRow}>
                          <span className={styles.chatUsername}>
                            {otherUser?.usernames || "Unknown User"}
                          </span>
                        </div>

                        <div className={styles.chatLastMessage}>
                          {chat.lastMessage || "Start chatting..."}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className={styles.chatRoomCard}>
            <div className={styles.chatRoomHeader}>
              <button
                className={styles.backButton}
                onClick={() => setSelectedChat(null)}
              >
                ← Back
              </button>

              <div className={styles.chatRoomUser}>
                <div className={styles.avatar}>
                  {selectedOtherUser?.usernames?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className={styles.chatRoomName}>
                    {selectedOtherUser?.usernames || "Chat"}
                  </div>
                  <div className={styles.chatRoomSub}>
                    {selectedOtherUser?.email || ""}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.messagesArea}>
              {messages.length === 0 ? (
                <div className={styles.emptyMessages}>No messages yet.</div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageRow} ${
                        isMine ? styles.myRow : styles.otherRow
                      }`}
                    >
                      <div
                        className={`${styles.messageBubble} ${
                          isMine ? styles.myBubble : styles.otherBubble
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className={styles.messageInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <button className={styles.sendButton} onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
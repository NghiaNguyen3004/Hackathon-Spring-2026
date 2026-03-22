import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
  } from "firebase/firestore";
  import { db } from "./firebase";
  
  export async function searchUsersByUsername(keyword: string, currentUid: string) {
    if (!keyword.trim()) return [];
  
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
  
    const users = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as any[];
  
    return users.filter(
      (user) =>
        user.uid !== currentUid &&
        user.usernames?.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  export async function getOrCreateChat(currentUser: any, otherUser: any) {
    const chatsRef = collection(db, "chats");
  
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUser.uid)
    );
  
    const snapshot = await getDocs(q);
  
    const existing = snapshot.docs.find((docSnap) => {
      const data = docSnap.data();
      return (
        Array.isArray(data.participants) &&
        data.participants.length === 2 &&
        data.participants.includes(currentUser.uid) &&
        data.participants.includes(otherUser.uid)
      );
    });
  
    if (existing) {
      return {
        id: existing.id,
        ...existing.data(),
      };
    }
  
    const newChat = {
      participants: [currentUser.uid, otherUser.uid],
      participantUsernames: [
        currentUser.usernames || "",
        otherUser.usernames || "",
      ],
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: "",
    };
  
    const docRef = await addDoc(chatsRef, newChat);
  
    return {
      id: docRef.id,
      ...newChat,
    };
  }
  
  export async function sendMessage(chatId: string, senderId: string, text: string) {
    if (!text.trim()) return;
  
    const messagesRef = collection(db, "chats", chatId, "messages");
  
    await addDoc(messagesRef, {
      senderId,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  
    const chatRef = doc(db, "chats", chatId);
  
    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: senderId,
    });
  }
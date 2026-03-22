"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function HeaderUser() {
  const [username, setUsername] = useState("...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsername("Guest");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUsername(userSnap.data().username || "User");
        } else {
          setUsername("User");
        }
      } catch (error) {
        console.error("Failed to load username:", error);
        setUsername("User");
      }
    });

    return () => unsubscribe();
  }, []);

  return <span>Hi, {username}</span>;
}
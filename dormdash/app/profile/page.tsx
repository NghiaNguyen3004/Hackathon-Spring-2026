"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AppShell from "@/components/Layout/AppShell";
import { auth, db } from "@/lib/firebase";

type SectionKey = "pending" | "assigned" | null;

type ProfileData = {
  username: string;
  email: string;
};

export default function ProfilePage() {
  const [openSection, setOpenSection] = useState<SectionKey>(null);
  const [profile, setProfile] = useState<ProfileData>({
    username: "Loading...",
    email: "Loading...",
  });

  const pendingRequests = [
    {
      title: "Help moving in/moving out",
      date: "March 25",
      time: "2:00 PM",
      location: "Dorm Building A, Room 203",
      notes: "Need two helpers",
    },
  ];

  const assignedRequests = [
    {
      title: "Help moving out/moving in",
      date: "March 30",
      time: "5:00 PM",
      location: "Dorm Building B, Room 101",
      notes: "Bring moving cart",
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile({
          username: "Guest",
          email: "Not signed in",
        });
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setProfile({
            username: data.username || "User",
            email: data.email || user.email || "No email",
          });
        } else {
          setProfile({
            username: "User",
            email: user.email || "No email",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setProfile({
          username: "User",
          email: user.email || "No email",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSection = (section: SectionKey) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <AppShell username={profile.username}>
      <div className="min-h-full bg-[#dfdfdf] p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-4xl font-bold text-gray-900">Profile</h1>

          <main className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <section className="rounded-3xl bg-red-500 p-6 shadow-lg">
              <div className="flex flex-col items-center">
                <div className="mb-4 h-24 w-24 rounded-full bg-gray-300" />
                <h2 className="text-3xl font-bold text-white">
                  {profile.username}
                </h2>
                <p className="mt-1 text-white">{profile.email}</p>
                <p className="mt-3 text-lg font-semibold text-white">User Bio</p>

                <button className="mt-4 w-full rounded-lg bg-red-700 py-2 text-white transition hover:opacity-80">
                  Edit Profile
                </button>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between rounded-lg bg-green-300 p-2 text-gray-900">
                  <span>Requests Submitted</span>
                  <span className="font-semibold">5</span>
                </div>

                <div className="flex justify-between rounded-lg bg-gray-300 p-2 text-gray-900">
                  <span>Requests Completed</span>
                  <span className="font-semibold">3</span>
                </div>

                <div className="flex justify-between rounded-lg bg-yellow-300 p-2 text-gray-900">
                  <span>Requests Pending</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </section>

            <section className="space-y-4 md:col-span-2">
              <DropdownSection
                title="Pending Requests"
                isOpen={openSection === "pending"}
                onClick={() => toggleSection("pending")}
                requests={pendingRequests}
              />

              <DropdownSection
                title="Assigned Requests"
                isOpen={openSection === "assigned"}
                onClick={() => toggleSection("assigned")}
                requests={assignedRequests}
              />

              <div className="flex justify-end">
                <button className="rounded-lg bg-green-500 px-6 py-2 font-semibold text-white transition hover:opacity-80">
                  Request New Help
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AppShell>
  );
}

function DropdownSection({
  title,
  isOpen,
  onClick,
  requests,
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  requests: {
    title: string;
    date: string;
    time: string;
    location: string;
    notes: string;
  }[];
}) {
  return (
    <div
      className="cursor-pointer rounded-2xl bg-red-500 p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="flex items-center justify-between text-lg font-semibold text-white">
        <span>{title}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2 pl-2 text-sm text-white/90">
          {requests.map((request, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-lg border bg-red-600 p-3"
            >
              <p>
                <strong>{request.title}</strong>
              </p>
              <p>Date: {request.date}</p>
              <p>Time: {request.time}</p>
              <p>Location: {request.location}</p>
              <p>Notes: {request.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
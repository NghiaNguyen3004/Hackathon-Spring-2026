
"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [openSection, setOpenSection] = useState<"pending" | "assigned" | null>(null);

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

  const Section = ({
    name,
    requests,
  }: {
    name: string;
    requests: typeof pendingRequests;
  }) => (
    <div
      className="bg-red-500 p-4 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      onClick={() =>
        setOpenSection(openSection === name.toLowerCase() ? null : name.toLowerCase() as "pending" | "assigned")
      }
    >
      <div className="flex justify-between items-center text-white font-semibold text-lg">
        {name}
        <span>{openSection === name.toLowerCase() ? "▲" : "▼"}</span>
      </div>

      {openSection === name.toLowerCase() && (
        <div className="mt-3 space-y-2 text-white/90 text-sm pl-2">
          {requests.map((r, i) => (
            <div key={i} className="p-2 border rounded-lg bg-red-600">
              <p><strong>{r.title}</strong></p>
              <p>Date: {r.date}</p>
              <p>Time: {r.time}</p>
              <p>Location: {r.location}</p>
              <p>Notes: {r.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-15 bg-red-500 text-white">
        <h1 className="text-4xl font-bold">DormDash</h1>
        <div className="flex items-center space-x-4">
            <p className="text-2xl text-white font-bold">Username</p>
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left column: Profile info */}
        <div className="bg-red-500 p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
          <h2 className="text-3xl text-white font-bold">Name abcdxyz</h2>
          <p className="text-white">evelyn@example.com</p>
          <p className="text-lg font-semibold text-white">User Bio</p>
          <button className="mt-4 w-full bg-red-700 text-white py-2 rounded-lg hover:opacity-80">
            Edit Profile
          </button>

          {/* User Stats */}
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between p-2 bg-green-300 rounded-lg">
              Requests Submitted <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-300 rounded-lg">
              Requests Completed <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between p-2 bg-yellow-300 rounded-lg">
              Requests Pending <span className="font-semibold">2</span>
            </div>
          </div>
        </div>

        {/* Right column: Requests */}
        <div className="md:col-span-2 space-y-4">
          <Section name="Pending Requests" requests={pendingRequests} />
          <Section name="Assigned Requests" requests={assignedRequests} />

          {/* CTA button */}
          <div className="flex justify-end mt-4">
            <button className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold hover:opacity-80">
              Request New Help
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
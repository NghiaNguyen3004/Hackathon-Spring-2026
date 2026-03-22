"use client"
import { useState } from "react"
import Modal from "@/components/RequestForm/Modal"
import RequestForm from "@/components/RequestForm/RequestForm"
import PostCard from "@/components/PostCard/PostCard"
 
export default function Board() {
  const [isOpen, setIsOpen] = useState(false)
  const [requestList, setRequestList] = useState([
    {name: "Nghia", content: "Lorem ipsum"},
    {name: "Evelyn", content: "Lorem ipsum"}
  ])
 
  function handleNewPost(post: { name: string; content: string }) {
    setRequestList((prev) => [...prev, post])
    setIsOpen(false)
  }
 
  return (
    <main className="min-h-screen p-8">
 
      {/* Create Post Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-500 text-white px-4 py-2 rounded font-semibold mb-6"
      >
        + Create a Post
      </button>
 
      {/* Posts List */}
      <div className="flex flex-col gap-4">
        {requestList.map((post, index) => (
          <PostCard key={`${post.name}-${index}`} username={post.name} content={post.content} />
        ))}
      </div>
 
      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <RequestForm onSuccess={handleNewPost} />
      </Modal>
 
    </main>
  )
}
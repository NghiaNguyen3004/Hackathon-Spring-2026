"use client"
import { useState } from "react"
import Modal from "@/components/RequestForm/Modal"
import RequestForm from "@/components/RequestForm/RequestForm"
import PostCard from "@/components/PostCard/PostCard"
 
export default function RequestList() {
  const [isOpen, setIsOpen] = useState(false)
  const [requestList, setRequestList] = useState([
    {name: "Nghia", content: "Lorem ipsum"},
    {name: "Evelyn", content: "Lorem ipsum"}
  ])
 
  function handleNewPost(post: { name: string; content: string }) {
    setRequestList((prev) => [...prev, post])
    setIsOpen(false)
  }
}
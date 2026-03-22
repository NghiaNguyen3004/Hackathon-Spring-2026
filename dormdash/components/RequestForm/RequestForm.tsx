"use client"; 
import { useState } from "react";

type RequestFormProps = {
  onSuccess: (post: { name: string; content: string }) => void;
};

export default function RequestForm({onSuccess}:RequestFormProps) {
    const [name, setName] = useState("");
    const [content, setContent] = useState("");

    function handleSubmit(){
    if(!name.trim() || !content.trim()) return;

    onSuccess({name: name.trim(), content: content.trim()})

    // Clear the form after a successful submit.
    setName("")
    setContent("")
    }

    return(
        <div className="flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-2">Post a Request</h2>
      <input
        className="border rounded px-3 py-2"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="border rounded px-3 py-2"
        placeholder="Request content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      <button
        onClick={handleSubmit}
        className="bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600"
      >
        Post Request
      </button>
    </div>
    )
}
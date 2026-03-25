import React, { useEffect, useState } from "react"
import StudentMessage from "./StudentMessage"
import api from "../api"

const StudentMessageMain = () => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    api
      .get("/api/messages/")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-md p-4">
      <h1 className="text-center text-2xl font-semibold text-green-700">
        Messages
      </h1>

      <div className="w-full h-px bg-gray-200 my-3"></div>

      <div className="overflow-y-auto max-h-[330px] space-y-2">
        {messages.map((msg) => (
          <StudentMessage
            key={msg.id}
            title={msg.title}
            message={msg.message}
          />
        ))}
      </div>
    </div>
  )
}

export default StudentMessageMain

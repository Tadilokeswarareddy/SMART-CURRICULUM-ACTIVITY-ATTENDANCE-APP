import React, { useEffect, useState } from "react";
import StudentMessage from "./StudentMessage";
import api from '../api'

const StudentMessageMain = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.get("/api/messages/")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="border h-[450px] w-[350px] rounded-3xl bg-white">
      <h1 className="flex justify-center mt-3 text-2xl font-semibold">MESSAGES</h1>
      <div className="w-full h-px bg-black my-3"></div>

      <div className="overflow-y-auto h-[330px] px-2">
        {messages.map((msg) => (
          <StudentMessage
            key={msg.id}
            title={msg.title}
            message={msg.message}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentMessageMain;

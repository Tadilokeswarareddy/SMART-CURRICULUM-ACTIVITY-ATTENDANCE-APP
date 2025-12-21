import React, { useEffect, useState } from "react";
import Teachermessage from '../../components/Teachermessages'
import api from '../../api'

const TeacherMessageMain = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.get("/api/teachermessages/")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="border h-[450px] w-[350px] rounded-3xl bg-white">
      <h1 className="flex justify-center mt-3 text-2xl font-semibold">MESSAGES</h1>
      <div className="w-full h-px bg-black my-3"></div>

      <div className="overflow-y-auto h-[330px] px-2">
        {messages.map((msg) => (
          <Teachermessage
            key={msg.id}
            title={msg.title}
            message={msg.message}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherMessageMain;

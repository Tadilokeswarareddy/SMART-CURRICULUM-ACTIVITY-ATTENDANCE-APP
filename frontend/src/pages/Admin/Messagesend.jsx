import React, { useState } from "react";
import api from '../../api'

const Messagesend = () => {

  const [studentTitle, setStudentTitle] = useState("");
  const [studentMessage, setStudentMessage] = useState("");

  const [teacherTitle, setTeacherTitle] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");

  const sendStudentMessage = async (e) => {
    e.preventDefault();

    if (!studentTitle || !studentMessage) {
      alert("Student title and message are required");
      return;
    }

    try {
      const response = await api.post("/api/messages/", {
        title: studentTitle,
        message: studentMessage,
        recipient_type: "student",
      });

      console.log(response.data);

      setStudentTitle("");
      setStudentMessage("");
    } catch (error) {
      console.error(error);
      alert("Failed to send student message");
    }
  };

  const sendTeacherMessage = async (e) => {
    e.preventDefault();

    if (!teacherTitle || !teacherMessage) {
      alert("Teacher title and message are required");
      return;
    }

    try {
      const response = await api.post("/api/teachermessages", {
        title: teacherTitle,
        message: teacherMessage,
        recipient_type: "teacher",
      });

      console.log(response.data);

      setTeacherTitle("");
      setTeacherMessage("");
    } catch (error) {
      console.error(error);
      alert("Failed to send teacher message");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-center mb-4 text-indigo-600">
            Send Message to Students
          </h2>

          <form onSubmit={sendStudentMessage} className="space-y-4">
            <input
              type="text"
              placeholder="Student Message Title"
              value={studentTitle}
              onChange={(e) => setStudentTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <textarea
              placeholder="Student Message"
              value={studentMessage}
              onChange={(e) => setStudentMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Send to Students
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-center mb-4 text-emerald-600">
            Send Message to Teachers
          </h2>

          <form onSubmit={sendTeacherMessage} className="space-y-4">
            <input
              type="text"
              placeholder="Teacher Message Title"
              value={teacherTitle}
              onChange={(e) => setTeacherTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <textarea
              placeholder="Teacher Message"
              value={teacherMessage}
              onChange={(e) => setTeacherMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
            />

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Send to Teachers
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Messagesend;

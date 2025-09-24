import React, { useState } from "react";

const StudentLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-lg w-100 h-90">
        <h1 className="text-2xl font-bold text-center mb-15">Student Portal</h1>
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 rounded-lg bg-[#444444] text-white focus:outline-none focus:ring-2 focus:ring-black mb-3"/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg bg-[#444444] text-white focus:outline-none focus:ring-2 focus:ring-black mb-3"
          />
          <button
            type="submit"
            className="p-3 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;

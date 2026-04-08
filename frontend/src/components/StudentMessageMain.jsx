import React, { useEffect, useState } from "react"
import StudentMessage from "./StudentMessage"
import api from "../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",
}

const StudentMessageMain = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/messages/inbox/")
      .then((res) => { setMessages(res.data); setLoading(false) })
      .catch((err) => { console.error(err); setLoading(false) })
  }, [])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');`}</style>
      <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"24px 22px", width:"100%", maxWidth:380, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }} />
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>Messages</h2>
        </div>

        <div style={{ overflowY:"auto", maxHeight:330, display:"flex", flexDirection:"column", gap:10 }}>
          {loading ? (
            <p style={{ textAlign:"center", color:"#9ca3af", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>Loading…</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign:"center", color:"#9ca3af", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <StudentMessage key={msg.id} title={msg.title} message={msg.message} senderName={msg.sent_by_name} senderType={msg.sender_type} date={msg.created_at} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default StudentMessageMain

import React from "react"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",
  600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",
}

const StudentMessage = ({ title, message, senderName, senderType, date }) => {
  const isAdmin = senderType === "admin"
  return (
    <div style={{ background:"#fff", borderRadius:12, border:`1.5px solid ${G[100]}`, padding:"14px 16px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:6 }}>
        <h3 style={{ margin:0, fontSize:13, fontWeight:700, color:G[900], lineHeight:1.3 }}>{title}</h3>
        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:999, whiteSpace:"nowrap", flexShrink:0,
          background: isAdmin ? "#dbeafe" : G[100],
          color: isAdmin ? "#1d4ed8" : G[700],
        }}>
          {isAdmin ? "Admin" : "Teacher"}
        </span>
      </div>
      <p style={{ margin:"0 0 10px", fontSize:12, color:"#6b7280", lineHeight:1.5 }}>{message}</p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#9ca3af" }}>{senderName}</span>
        <span style={{ fontSize:11, color:"#9ca3af" }}>{date ? new Date(date).toLocaleDateString() : ""}</span>
      </div>
    </div>
  )
}

export default StudentMessage


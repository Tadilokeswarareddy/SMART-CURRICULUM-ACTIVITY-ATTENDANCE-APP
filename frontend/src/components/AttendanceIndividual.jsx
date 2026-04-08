// ─────────────────────────────────────────────
//  AttendanceIndividual.jsx
// ─────────────────────────────────────────────
import React from "react"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const AttendanceIndividual = ({ subject, presentClasses, totalClasses, teacherName, courseCode, syllabusUrl }) => {
  const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0
  const dashArray = 100
  const dashOffset = dashArray - (percentage / 100) * dashArray
  const absentClasses = totalClasses - presentClasses

  const ringColor = percentage >= 75 ? G[500] : percentage >= 50 ? "#f59e0b" : "#ef4444"

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');`}</style>
      <div style={{ display:"flex", alignItems:"flex-start", gap:16, paddingTop:4, paddingBottom:4 }}>
        {/* Ring */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
          <div style={{ position:"relative", width:68, height:68 }}>
            <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke={G[100]} strokeWidth="2.5" />
              <circle cx="18" cy="18" r="16" fill="none" stroke={ringColor} strokeWidth="2.5"
                strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" />
            </svg>
            <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>
              {percentage}%
            </span>
          </div>
          <span style={{ fontSize:10, color:"#9ca3af", fontFamily:"'DM Sans',sans-serif", marginTop:4, letterSpacing:"0.5px" }}>Attendance</span>
        </div>

        {/* Info */}
        <div style={{ flex:1, fontFamily:"'DM Sans',sans-serif" }}>
          <h3 style={{ margin:"0 0 4px", fontSize:15, fontWeight:700, color:G[900] }}>{subject}</h3>
          <p style={{ margin:"0 0 2px", fontSize:12, color:"#6b7280" }}>Teacher: <span style={{ fontWeight:600, color:G[800] }}>{teacherName}</span></p>
          <p style={{ margin:"0 0 2px", fontSize:12, color:"#6b7280" }}>Code: <span style={{ fontWeight:600, color:G[800] }}>{courseCode}</span></p>
          <p style={{ margin:"0 0 6px", fontSize:12, color:"#6b7280" }}>
            Classes: <span style={{ fontWeight:600, color:G[800] }}>{presentClasses}/{totalClasses}</span>
            <span style={{ color:"#9ca3af" }}> ({absentClasses} absent)</span>
          </p>
          {syllabusUrl && (
            <a href={syllabusUrl} download style={{ display:"inline-block", padding:"4px 14px", borderRadius:999, border:`1.5px solid ${G[300]}`, color:G[700], background:G[50], fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
              Syllabus
            </a>
          )}
        </div>
      </div>
      <div style={{ width:"100%", height:1, background:G[100], margin:"14px 0" }} />
    </>
  )
}

export default AttendanceIndividual
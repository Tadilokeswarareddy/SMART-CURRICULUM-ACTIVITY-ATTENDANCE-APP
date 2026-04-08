import React, { useState, useEffect } from "react"
import StudentNav from "../../components/StudentNav"
import api from "../../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const dayKeyMap = { Monday:"mon", Tuesday:"tue", Wednesday:"wed", Thursday:"thu", Friday:"fri" }

const StudentTimetable = () => {
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [timetable, setTimetable] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/timetable/student/").then((res) => {
      const grouped = {}
      days.forEach((d) => (grouped[d] = []))
      res.data.forEach((entry) => {
        const dayLabel = Object.keys(dayKeyMap).find((k) => dayKeyMap[k] === entry.day)
        if (dayLabel) grouped[dayLabel].push({
          time: `${entry.start_time?.slice(0,5)} - ${entry.end_time?.slice(0,5)}`,
          subject: entry.assignment.subject.name,
          section: `${entry.assignment.section.branch.name} - ${entry.assignment.section.name}`,
          teacher: entry.assignment.teacher,
          code: entry.assignment.subject.code,
        })
      })
      setTimetable(grouped); setLoading(false)
    }).catch(() => { setError("Failed to load timetable"); setLoading(false) })
  }, [])

  if (loading) return (
    <>
      <StudentNav />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 64px)", background:G[50] }}>
        <p style={{ color:G[600], fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Loading timetable…</p>
      </div>
    </>
  )
  if (error) return (
    <>
      <StudentNav />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"calc(100vh - 64px)", background:G[50] }}>
        <p style={{ color:"#dc2626", fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>{error}</p>
      </div>
    </>
  )

  return (
    <>
      <StudentNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .tt-card:hover { box-shadow:0 6px 24px rgba(21,128,61,0.12) !important; transform:translateY(-2px); }
      `}</style>

      <div style={{ minHeight:"calc(100vh - 64px)", background:G[50], padding:"28px 20px 56px", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>

          {/* Day tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:24, overflowX:"auto", paddingBottom:4 }}>
            {days.map((day) => {
              const active = selectedDay === day
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  style={{ padding:"9px 20px", borderRadius:999, border:"none", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s",
                    background: active ? G[700] : "#fff",
                    color: active ? "#fff" : G[700],
                    boxShadow: active ? `0 2px 12px ${G[300]}` : `0 0 0 1.5px ${G[200]}`,
                  }}>
                  {day}
                </button>
              )
            })}
          </div>

          {/* Card */}
          <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"28px", animation:"fadeUp 0.4s ease both" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
              <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})` }} />
              <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>{selectedDay}'s Schedule</h2>
            </div>

            {!timetable[selectedDay] || timetable[selectedDay].length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <span style={{ fontSize:32 }}>📅</span>
                <p style={{ color:"#9ca3af", fontSize:13, fontFamily:"'DM Sans',sans-serif", marginTop:8 }}>No classes scheduled for this day.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
                {timetable[selectedDay].map((cls, index) => (
                  <div key={index} className="tt-card" style={{ border:`1.5px solid ${G[100]}`, borderRadius:14, padding:"18px 16px", background:G[50], transition:"all 0.2s", cursor:"default" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:3, height:16, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})` }} />
                      <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>{cls.subject}</h3>
                    </div>
                    <span style={{ display:"inline-block", background:G[100], color:G[700], borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:"0.8px", marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{cls.code}</span>
                    <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280", fontFamily:"'DM Sans',sans-serif" }}>{cls.section}</p>
                    <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280", fontFamily:"'DM Sans',sans-serif" }}>
                      <span style={{ fontWeight:600, color:G[800] }}>Time:</span> {cls.time}
                    </p>
                    <p style={{ margin:0, fontSize:12, color:"#6b7280", fontFamily:"'DM Sans',sans-serif" }}>
                      <span style={{ fontWeight:600, color:G[800] }}>Teacher:</span> {cls.teacher}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentTimetable
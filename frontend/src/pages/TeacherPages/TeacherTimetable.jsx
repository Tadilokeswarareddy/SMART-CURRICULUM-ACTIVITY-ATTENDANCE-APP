import React, { useState, useEffect } from "react"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
const dayKeyMap = { Monday:"mon",Tuesday:"tue",Wednesday:"wed",Thursday:"thu",Friday:"fri" }

const TeacherTimetable = () => {
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [timetable, setTimetable]     = useState({})
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    api.get("/api/timetable/teacher/").then(res => {
      const grouped = {}
      days.forEach(d => (grouped[d] = []))
      res.data.forEach(entry => {
        const dayLabel = Object.keys(dayKeyMap).find(k => dayKeyMap[k] === entry.day)
        if (dayLabel) grouped[dayLabel].push({
          time: `${entry.start_time?.slice(0,5)} – ${entry.end_time?.slice(0,5)}`,
          subject: entry.assignment.subject.name,
          code: entry.assignment.subject.code,
          section: `${entry.assignment.section.branch.name} · ${entry.assignment.section.name}`,
        })
      })
      setTimetable(grouped); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .tt-card:hover { box-shadow:0 6px 24px rgba(21,128,61,0.12)!important; transform:translateY(-2px); }
      `}</style>

      <div style={{ minHeight:"100vh", background:G[50], fontFamily:"'DM Sans',sans-serif" }}>
        <TeacherNav />

        {/* Banner */}
        <div style={{
          position:"relative",
          background:`linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`,
          paddingTop:56, paddingBottom:60, overflow:"hidden",
        }}>
          <div style={{ position:"absolute",top:-70,right:-70,width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
          <div style={{ position:"absolute",bottom:16,right:140,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }}/>
          <div style={{ maxWidth:900, margin:"0 auto", padding:"0 28px", position:"relative", zIndex:1, animation:"fadeUp 0.45s ease both" }}>
            <span style={{ display:"block", fontSize:11, fontWeight:700, color:G[300], letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:6 }}>Schedule</span>
            <h1 style={{ margin:"0 0 10px", fontSize:30, fontWeight:700, color:"#fff", fontFamily:"'DM Serif Display',serif", lineHeight:1.15 }}>Time Table</h1>
            <span style={{ display:"inline-block", background:"rgba(255,255,255,0.14)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.22)", color:"#fff", borderRadius:999, padding:"4px 14px", fontSize:13, fontWeight:600 }}>
              Weekly Overview
            </span>
          </div>
          <svg style={{ position:"absolute",bottom:0,left:0,width:"100%",height:56,display:"block" }} viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,28 C480,70 960,0 1440,32 L1440,56 L0,56 Z" fill={G[50]}/>
          </svg>
        </div>

        <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px 56px" }}>

          {/* Day selector */}
          <div style={{ display:"flex", gap:8, marginBottom:24, overflowX:"auto", paddingBottom:4, animation:"fadeUp 0.5s ease both" }}>
            {days.map(day => {
              const active = selectedDay === day
              return (
                <button key={day} onClick={() => setSelectedDay(day)} style={{
                  padding:"9px 22px", borderRadius:999, border:"none",
                  fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12,
                  letterSpacing:"0.5px", cursor:"pointer", whiteSpace:"nowrap",
                  transition:"all 0.2s",
                  background: active ? G[700] : "#fff",
                  color: active ? "#fff" : G[700],
                  boxShadow: active ? `0 2px 14px ${G[300]}` : `0 0 0 1.5px ${G[200]}`,
                }}>
                  {day}
                </button>
              )
            })}
          </div>

          {/* Schedule card */}
          <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"28px", animation:"fadeUp 0.45s ease both", animationDelay:"0.08s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
              <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }}/>
              <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>{selectedDay}'s Schedule</h2>
            </div>

            {loading ? (
              <p style={{ color:"#9ca3af", fontSize:13 }}>Loading timetable…</p>
            ) : !timetable[selectedDay] || timetable[selectedDay].length === 0 ? (
              <div style={{ textAlign:"center", padding:"36px 0" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:G[100], display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                  <div style={{ width:20, height:2, background:G[300], borderRadius:2 }}/>
                </div>
                <p style={{ color:"#9ca3af", fontSize:13 }}>No classes scheduled for this day.</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:16 }}>
                {timetable[selectedDay].map((cls, i) => (
                  <div key={i} className="tt-card" style={{
                    background:G[50], border:`1.5px solid ${G[200]}`,
                    borderRadius:14, padding:"18px 16px",
                    transition:"all 0.2s", cursor:"default",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:3, height:16, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }}/>
                      <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:G[800] }}>{cls.subject}</h3>
                    </div>
                    <span style={{ display:"inline-block", background:G[100], color:G[700], borderRadius:6, padding:"2px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.8px", marginBottom:10 }}>
                      {cls.code}
                    </span>
                    <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280" }}>{cls.section}</p>
                    <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>
                      <span style={{ fontWeight:700, color:G[800] }}>Time: </span>{cls.time}
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

export default TeacherTimetable
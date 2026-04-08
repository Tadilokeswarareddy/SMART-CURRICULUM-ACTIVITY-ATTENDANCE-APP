import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import TeacherNav from "../components/TeacherNav"
import api from "../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const Heading = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
    <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }} />
    <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.1px" }}>{label}</h2>
  </div>
)

const TeacherHome = () => {
  const [assignments, setAssignments]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [statsData, setStatsData]         = useState({ sections:[], students:[] })
  const [statsLoading, setStatsLoading]   = useState(true)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    api.get("/api/assignments/")
      .then(res => setAssignments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setStatsLoading(true)
    const url = activeSection
      ? `/api/task/teacher-stats/?section_id=${activeSection}`
      : "/api/task/teacher-stats/"
    api.get(url)
      .then(res => setStatsData(res.data))
      .catch(err => console.error(err))
      .finally(() => setStatsLoading(false))
  }, [activeSection])

  const { sections, students } = statsData

  const allSubjects = (() => {
    const map = {}
    students.forEach(s => (s.attendance || []).forEach(a => { map[a.subject_code] = a.subject_name }))
    return Object.entries(map).map(([code, name]) => ({ code, name }))
  })()

  const scoreColor = score => {
    if (score == null) return "#d1d5db"
    if (score >= 8) return G[700]
    if (score >= 5) return "#d97706"
    return "#dc2626"
  }
  const attColor = pct => pct >= 75 ? G[700] : pct >= 60 ? "#d97706" : "#dc2626"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .th-action:hover { box-shadow:0 4px 20px rgba(0,0,0,0.1)!important; transform:translateY(-2px); }
        .th-row:hover { background:${G[50]}!important; }
        .th-tab:hover { border-color:${G[400]}!important; color:${G[700]}!important; }
      `}</style>

      <div style={{ minHeight:"100vh", background:G[50], fontFamily:"'DM Sans',sans-serif" }}>
        <TeacherNav />

        {/* ── Banner ── */}
        <div style={{
          position:"relative",
          background:`linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`,
          paddingTop:56, paddingBottom:60, overflow:"hidden",
        }}>
          <div style={{ position:"absolute",top:-70,right:-70,width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }}/>
          <div style={{ position:"absolute",bottom:16,right:140,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }}/>
          <div style={{ position:"absolute",top:24,left:-50,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,0.03)" }}/>

          <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 28px", position:"relative", zIndex:1, animation:"fadeUp 0.45s ease both" }}>
            <span style={{ display:"block", fontSize:11, fontWeight:700, color:G[300], letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:6 }}>Teacher Portal</span>
            <h1 style={{ margin:"0 0 10px", fontSize:30, fontWeight:700, color:"#fff", fontFamily:"'DM Serif Display',serif", lineHeight:1.15 }}>Dashboard</h1>
            <span style={{ display:"inline-block", background:"rgba(255,255,255,0.14)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.22)", color:"#fff", borderRadius:999, padding:"4px 14px", fontSize:13, fontWeight:600 }}>
              Overview
            </span>
          </div>

          <svg style={{ position:"absolute",bottom:0,left:0,width:"100%",height:56,display:"block" }} viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,28 C480,70 960,0 1440,32 L1440,56 L0,56 Z" fill={G[50]}/>
          </svg>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 56px" }}>

          {/* Quick actions */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28, animation:"fadeUp 0.5s ease both", animationDelay:"0.1s" }}>
            {[
              { to:"/markattendance",   label:"Mark Attendance", sub:"QR or manual",      accent:"#3b82f6" },
              { to:"/teachertimetable", label:"Time Table",       sub:"View your schedule", accent:G[600]    },
              { to:"/teachermessages",  label:"Messages",         sub:"Inbox & send",       accent:"#7c3aed" },
            ].map(({ to, label, sub, accent }) => (
              <Link key={to} to={to} className="th-action" style={{
                display:"flex", flexDirection:"column", gap:4,
                background:"#fff", borderRadius:14, padding:"20px 20px",
                boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,
                borderLeft:`4px solid ${accent}`,
                textDecoration:"none",
                transition:"box-shadow 0.2s,transform 0.2s",
              }}>
                <span style={{ fontSize:14, fontWeight:700, color:G[800] }}>{label}</span>
                <span style={{ fontSize:12, color:"#9ca3af" }}>{sub}</span>
              </Link>
            ))}
          </div>

          {/* Your Classes */}
          <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"28px", marginBottom:24, animation:"fadeUp 0.5s ease both", animationDelay:"0.18s" }}>
            <Heading label="Your Classes" />
            {loading ? (
              <p style={{ color:"#9ca3af", fontSize:13 }}>Loading…</p>
            ) : assignments.length === 0 ? (
              <p style={{ color:"#9ca3af", fontSize:13 }}>No classes assigned yet.</p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
                {assignments.map(a => (
                  <div key={a.id} style={{
                    background:G[50], border:`1.5px solid ${G[200]}`,
                    borderRadius:12, padding:"16px",
                  }}>
                    <p style={{ margin:"0 0 2px", fontSize:14, fontWeight:700, color:G[800] }}>{a.subject.name}</p>
                    <p style={{ margin:"0 0 6px", fontSize:11, color:G[600], fontWeight:600, letterSpacing:"0.5px" }}>{a.subject.code}</p>
                    <p style={{ margin:"0 0 12px", fontSize:12, color:"#6b7280" }}>{a.section.branch.name} · {a.section.name}</p>
                    <Link to="/markattendance" style={{ fontSize:12, color:G[700], fontWeight:600, textDecoration:"none" }}>
                      Mark Attendance →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Performance */}
          <div style={{ background:"#fff", borderRadius:18, boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`, padding:"28px", animation:"fadeUp 0.5s ease both", animationDelay:"0.26s" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }} />
                <div>
                  <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif" }}>Student Performance</h2>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"#9ca3af" }}>Tasks · Attendance · AI Scores</p>
                </div>
              </div>
              {!statsLoading && (
                <span style={{ background:G[100], color:G[700], borderRadius:999, padding:"4px 14px", fontSize:12, fontWeight:700 }}>
                  {students.length} student{students.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Section tabs */}
            {sections.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
                {[{ id:null, branch:"All", name:"Sections" }, ...sections.map(s => ({ id:s.id, branch:s.branch, name:s.name }))].map(sec => {
                  const active = activeSection === sec.id
                  return (
                    <button key={sec.id ?? "all"} className={active ? "" : "th-tab"}
                      onClick={() => setActiveSection(sec.id)}
                      style={{
                        fontSize:11, fontWeight:700, padding:"6px 16px",
                        borderRadius:999, border:`1.5px solid ${active ? G[700] : G[200]}`,
                        background: active ? G[700] : "#fff",
                        color: active ? "#fff" : G[600],
                        cursor:"pointer", transition:"all 0.2s",
                        fontFamily:"'DM Sans',sans-serif",
                      }}>
                      {sec.id === null ? "All Sections" : `${sec.branch} · ${sec.name}`}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Table */}
            {statsLoading ? (
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"32px 0", justifyContent:"center" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", border:`3px solid ${G[200]}`, borderTop:`3px solid ${G[500]}`, animation:"spin 0.75s linear infinite" }}/>
                <span style={{ color:"#9ca3af", fontSize:13 }}>Loading student data…</span>
              </div>
            ) : students.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:G[100], display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                  <div style={{ width:20, height:20, borderRadius:2, background:G[300] }} />
                </div>
                <p style={{ color:"#9ca3af", fontSize:13 }}>No students found for this section.</p>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:`1.5px solid ${G[100]}` }}>
                      {["Student", "Roll No.", "Tasks Done", "AI Score", ...allSubjects.map(s => s.name)].map((h, i) => (
                        <th key={i} style={{
                          textAlign: i <= 1 ? "left" : "center",
                          padding:"8px 12px 10px", fontSize:10, fontWeight:700,
                          color:G[600], textTransform:"uppercase", letterSpacing:"1.2px",
                          whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif",
                        }}>
                          {h}
                          {i > 3 && <span style={{ display:"block", textTransform:"none", letterSpacing:0, color:"#d1d5db", fontWeight:400 }}>attendance</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const attMap = {}
                      ;(s.attendance || []).forEach(a => { attMap[a.subject_code] = a })
                      return (
                        <tr key={s.student_id} className="th-row" style={{ borderBottom:`1px solid ${G[50]}`, transition:"background 0.15s" }}>
                          <td style={{ padding:"12px" }}>
                            <p style={{ margin:0, fontWeight:700, color:G[800], fontSize:13 }}>{s.name}</p>
                            <p style={{ margin:"2px 0 0", fontSize:11, color:"#9ca3af" }}>{s.email}</p>
                          </td>
                          <td style={{ padding:"12px", fontSize:12, color:"#6b7280" }}>{s.roll_number}</td>
                          <td style={{ padding:"12px", textAlign:"center" }}>
                            <span style={{ background:G[100], color:G[700], borderRadius:999, padding:"3px 12px", fontSize:12, fontWeight:700 }}>
                              {s.completed_tasks}
                            </span>
                          </td>
                          <td style={{ padding:"12px", textAlign:"center" }}>
                            {s.average_score != null
                              ? <span style={{ fontWeight:700, color:scoreColor(s.average_score), fontSize:13 }}>{s.average_score}/10</span>
                              : <span style={{ color:"#d1d5db", fontSize:12 }}>—</span>}
                          </td>
                          {allSubjects.map(sub => {
                            const att = attMap[sub.code]
                            return (
                              <td key={sub.code} style={{ padding:"12px", textAlign:"center" }}>
                                {att ? (
                                  <>
                                    <div style={{ fontWeight:700, fontSize:12, color:attColor(att.percentage) }}>{att.percentage}%</div>
                                    <div style={{ fontSize:11, color:"#d1d5db", marginTop:1 }}>{att.present}/{att.total}</div>
                                  </>
                                ) : <span style={{ color:"#d1d5db" }}>—</span>}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            {students.length > 0 && !statsLoading && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:20, marginTop:16, paddingTop:16, borderTop:`1px solid ${G[100]}` }}>
                {[
                  { color:G[700], label:"≥75% attendance" },
                  { color:"#d97706", label:"60–74% attendance" },
                  { color:"#dc2626", label:"<60% attendance" },
                  { color:G[700], label:"AI score ≥8", border:true },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
                    <span style={{ fontSize:11, color:"#9ca3af" }}>{label}</span>
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

export default TeacherHome
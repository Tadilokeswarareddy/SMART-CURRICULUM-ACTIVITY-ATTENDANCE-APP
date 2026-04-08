import React, { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

const G = {
  50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",
  400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",
  800:"#166534",900:"#14532d",
}

const fmt     = iso => iso ? new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) : ""
const fmtDate = d   => d   ? new Date(d).toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" }) : ""

const Heading = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
    <div style={{ width:3, height:20, borderRadius:2, background:`linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink:0 }} />
    <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:G[800], fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.1px" }}>{label}</h2>
  </div>
)

const ErrorBox = ({ msg }) => msg ? (
  <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", color:"#dc2626", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>{msg}</div>
) : null

const SuccessBox = ({ msg }) => msg ? (
  <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, color:G[700], borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>{msg}</div>
) : null

const Pill = ({ ok, children }) => (
  <span style={{
    display:"inline-block", padding:"3px 12px", borderRadius:999,
    fontSize:11, fontWeight:700,
    background: ok ? G[100] : "#f3f4f6",
    color: ok ? G[700] : "#6b7280",
  }}>{children}</span>
)

const card = {
  background:"#fff", borderRadius:18,
  boxShadow:`0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,
  padding:"28px", marginBottom:24,
}

const MarkAttendance = () => {
  const [assignments, setAssignments]     = useState([])
  const [assignmentId, setAssignmentId]   = useState("")
  const [tab, setTab]                     = useState("qr")

  const [qrValue, setQrValue]             = useState("")
  const [qrSessionId, setQrSessionId]     = useState(null)
  const [counter, setCounter]             = useState(300)
  const [isActive, setIsActive]           = useState(false)
  const [qrError, setQrError]             = useState("")

  const [students, setStudents]           = useState([])
  const [presentIds, setPresentIds]       = useState([])
  const [manualSessionId, setManualSessionId] = useState(null)
  const [creatingSession, setCreatingSession] = useState(false)
  const [manualSaving, setManualSaving]   = useState(false)
  const [manualMsg, setManualMsg]         = useState("")
  const [manualError, setManualError]     = useState("")

  const [sessions, setSessions]           = useState([])
  const [sessionDetail, setSessionDetail] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    api.get("/api/assignments/").then(r => setAssignments(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (!isActive) return
    const t = setInterval(() => {
      setCounter(p => {
        if (p <= 1) { clearInterval(t); setIsActive(false); setQrValue(""); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [isActive])

  useEffect(() => {
    if (!assignmentId) { setStudents([]); return }
    const a = assignments.find(x => x.id === parseInt(assignmentId))
    if (!a) return
    api.get(`/api/sections/${a.section.id}/students/`)
      .then(r => { setStudents(r.data); setPresentIds([]) })
      .catch(console.error)
  }, [assignmentId, assignments])

  useEffect(() => {
    if (tab === "history" && assignmentId) loadHistory()
  }, [tab, assignmentId])

  const resetAll = val => {
    setAssignmentId(val)
    setIsActive(false); setQrValue(""); setQrSessionId(null); setQrError("")
    setManualSessionId(null); setManualMsg(""); setManualError(""); setPresentIds([])
    setSessions([]); setSessionDetail(null)
  }

  const startQr = async () => {
    setQrError("")
    try {
      const r = await api.post("/api/attendance/start/", { assignment_id: parseInt(assignmentId) })
      setQrValue(r.data.qr_token); setQrSessionId(r.data.session_id)
      setCounter(300); setIsActive(true)
    } catch (e) { setQrError(e.response?.data?.error || "Failed to start attendance") }
  }

  const createManualSession = async () => {
    setCreatingSession(true); setManualError("")
    try {
      const r = await api.post("/api/attendance/start/", { assignment_id: parseInt(assignmentId) })
      setManualSessionId(r.data.session_id)
    } catch (e) { setManualError(e.response?.data?.error || "Failed to create session") }
    setCreatingSession(false)
  }

  const toggleStudent = id =>
    setPresentIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const saveManual = async () => {
    if (!manualSessionId) { setManualError("Start a session first."); return }
    setManualSaving(true); setManualMsg(""); setManualError("")
    try {
      await api.post("/api/attendance/manual/", { session_id: manualSessionId, present_student_ids: presentIds })
      setManualMsg(`Saved! ${presentIds.length} of ${students.length} marked present.`)
    } catch (e) { setManualError(e.response?.data?.error || "Failed to save") }
    setManualSaving(false)
  }

  const loadHistory = async () => {
    setLoadingHistory(true); setSessions([]); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/sessions/?assignment_id=${assignmentId}`)
      setSessions(r.data)
    } catch (e) { console.error(e) }
    setLoadingHistory(false)
  }

  const loadDetail = async sid => {
    setLoadingDetail(true); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/session/${sid}/`)
      setSessionDetail(r.data)
    } catch (e) { console.error(e) }
    setLoadingDetail(false)
  }

  const selectedAssignment = assignments.find(a => a.id === parseInt(assignmentId))
  const pct = Math.round((counter / 300) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .ma-tab-active  { border-bottom:2px solid ${G[700]}!important; color:${G[700]}!important; }
        .ma-tab:hover   { color:${G[600]}!important; }
        .ma-student:hover { border-color:${G[400]}!important; }
        .ma-session:hover { border-color:${G[300]}!important; box-shadow:0 2px 12px rgba(21,128,61,0.1)!important; }
        .ma-select:focus { border-color:${G[400]}!important; box-shadow:0 0 0 3px ${G[100]}!important; outline:none; }
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
          <div style={{ maxWidth:820, margin:"0 auto", padding:"0 28px", position:"relative", zIndex:1, animation:"fadeUp 0.45s ease both" }}>
            <span style={{ display:"block", fontSize:11, fontWeight:700, color:G[300], letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:6 }}>Attendance</span>
            <h1 style={{ margin:"0 0 10px", fontSize:30, fontWeight:700, color:"#fff", fontFamily:"'DM Serif Display',serif", lineHeight:1.15 }}>Mark Attendance</h1>
            {selectedAssignment && (
              <span style={{ display:"inline-block", background:"rgba(255,255,255,0.14)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.22)", color:"#fff", borderRadius:999, padding:"4px 14px", fontSize:13, fontWeight:600 }}>
                {selectedAssignment.subject.name} · {selectedAssignment.section.branch.name} {selectedAssignment.section.name}
              </span>
            )}
          </div>
          <svg style={{ position:"absolute",bottom:0,left:0,width:"100%",height:56,display:"block" }} viewBox="0 0 1440 56" preserveAspectRatio="none">
            <path d="M0,28 C480,70 960,0 1440,32 L1440,56 L0,56 Z" fill={G[50]}/>
          </svg>
        </div>

        <div style={{ maxWidth:820, margin:"0 auto", padding:"32px 24px 56px" }}>

          {/* Class selector */}
          <div style={{ ...card, padding:"22px 24px", marginBottom:20, animation:"fadeUp 0.5s ease both" }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, color:G[600], textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:10 }}>Select Class</label>
            <select value={assignmentId} onChange={e => resetAll(e.target.value)}
              className="ma-select"
              style={{ width:"100%", maxWidth:420, border:`1.5px solid ${G[200]}`, borderRadius:10, padding:"10px 14px", fontSize:14, color:G[900], background:G[50], cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s,box-shadow 0.2s" }}>
              <option value="">— Pick a class —</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.subject.name} — {a.section.branch.name} {a.section.name}</option>
              ))}
            </select>
          </div>

          {/* Tab bar */}
          {assignmentId && (
            <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${G[100]}`, marginBottom:24, animation:"fadeUp 0.5s ease both", animationDelay:"0.08s" }}>
              {[["qr","QR Attendance"],["manual","Manual Attendance"],["history","History"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`ma-tab${tab === key ? " ma-tab-active" : ""}`}
                  style={{
                    padding:"10px 22px", border:"none", background:"none", cursor:"pointer",
                    fontSize:13, fontWeight:700, color: tab === key ? G[700] : "#9ca3af",
                    borderBottom: tab === key ? `2px solid ${G[700]}` : "2px solid transparent",
                    marginBottom:-2, transition:"color 0.15s",
                    fontFamily:"'DM Sans',sans-serif",
                  }}>{label}</button>
              ))}
            </div>
          )}

          {/* ── QR TAB ── */}
          {assignmentId && tab === "qr" && (
            <div style={{ ...card, animation:"fadeUp 0.4s ease both" }}>
              <Heading label="QR Code Session" />
              <ErrorBox msg={qrError} />
              {!isActive ? (
                <div style={{ textAlign:"center", padding:"28px 0" }}>
                  <p style={{ color:"#6b7280", fontSize:13, marginBottom:24, maxWidth:360, margin:"0 auto 24px", lineHeight:1.6 }}>
                    Generate a QR code for students in <strong style={{ color:G[700] }}>{selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}</strong> to scan. Expires in 5 minutes.
                  </p>
                  <button onClick={startQr} style={{ background:G[700], color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Generate QR Code
                  </button>
                </div>
              ) : (
                <div style={{ textAlign:"center" }}>
                  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:20, marginBottom:24 }}>
                    <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
                      <circle cx="30" cy="30" r="25" fill="none" stroke={G[100]} strokeWidth="4"/>
                      <circle cx="30" cy="30" r="25" fill="none"
                        stroke={counter > 60 ? G[600] : "#dc2626"} strokeWidth="4"
                        strokeDasharray={`${2*Math.PI*25}`}
                        strokeDashoffset={`${2*Math.PI*25*(1-pct/100)}`}
                        strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s linear,stroke 0.5s" }}/>
                    </svg>
                    <div style={{ textAlign:"left" }}>
                      <p style={{ margin:0, fontSize:32, fontWeight:700, color: counter > 60 ? G[700] : "#dc2626", lineHeight:1, fontFamily:"'DM Serif Display',serif" }}>{counter}s</p>
                      <p style={{ margin:"4px 0 0", fontSize:11, color:"#9ca3af" }}>until expiry</p>
                    </div>
                  </div>
                  <div style={{ display:"inline-block", padding:16, background:G[50], borderRadius:16, border:`1.5px solid ${G[200]}`, marginBottom:16 }}>
                    <QRCodeCanvas value={qrValue} size={220}/>
                  </div>
                  <p style={{ fontSize:12, color:"#9ca3af", margin:"0 0 20px" }}>
                    Only students from <strong style={{ color:G[700] }}>{selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}</strong> can mark attendance
                  </p>
                  <button onClick={() => { setIsActive(false); setQrValue("") }}
                    style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Stop Session
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MANUAL TAB ── */}
          {assignmentId && tab === "manual" && (
            <div style={{ ...card, animation:"fadeUp 0.4s ease both" }}>
              <Heading label="Manual Attendance" />
              {!manualSessionId ? (
                <div style={{ background:"#fffbeb", border:"1.5px solid #fde68a", borderRadius:12, padding:"18px", marginBottom:20 }}>
                  <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:"#92400e" }}>No session started yet</p>
                  <p style={{ margin:"0 0 14px", fontSize:12, color:"#b45309", lineHeight:1.6 }}>
                    Recording attendance for <strong>{selectedAssignment?.subject.name}</strong> — {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name} · {fmtDate(new Date().toISOString())}
                  </p>
                  <ErrorBox msg={manualError} />
                  <button onClick={createManualSession} disabled={creatingSession}
                    style={{ background:"#2563eb", color:"#fff", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:600, cursor:"pointer", opacity:creatingSession?0.6:1, fontFamily:"'DM Sans',sans-serif" }}>
                    {creatingSession ? "Starting…" : "Start Attendance Session"}
                  </button>
                </div>
              ) : (
                <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:G[100], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:G[600] }}/>
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:G[800] }}>Session Active</p>
                    <p style={{ margin:0, fontSize:11, color:G[600] }}>{selectedAssignment?.subject.name} · {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name} · {fmtDate(new Date().toISOString())}</p>
                  </div>
                </div>
              )}

              {students.length === 0 ? (
                <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"24px 0" }}>No students found in this section.</p>
              ) : (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <p style={{ margin:0, fontSize:13, color:"#374151", fontWeight:600 }}>
                      {students.length} students · <span style={{ color:G[700] }}>{presentIds.length} present</span> · <span style={{ color:"#dc2626" }}>{students.length - presentIds.length} absent</span>
                    </p>
                    <div style={{ display:"flex", gap:16 }}>
                      <button onClick={() => setPresentIds(students.map(s => s.id))} style={{ background:"none", border:"none", color:G[700], fontSize:12, fontWeight:700, cursor:"pointer", textDecoration:"underline", padding:0, fontFamily:"'DM Sans',sans-serif" }}>Select All</button>
                      <button onClick={() => setPresentIds([])} style={{ background:"none", border:"none", color:"#dc2626", fontSize:12, fontWeight:700, cursor:"pointer", textDecoration:"underline", padding:0, fontFamily:"'DM Sans',sans-serif" }}>Clear</button>
                    </div>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:400, overflowY:"auto", marginBottom:20 }}>
                    {students.map(s => {
                      const present = presentIds.includes(s.id)
                      return (
                        <div key={s.id} onClick={() => toggleStudent(s.id)} className="ma-student"
                          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderRadius:10, border:`1.5px solid ${present ? G[300] : G[200]}`, background: present ? G[50] : "#fff", cursor:"pointer", transition:"all 0.12s" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${present ? G[600] : G[300]}`, background: present ? G[600] : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.12s" }}>
                              {present && <span style={{ color:"#fff", fontSize:10, fontWeight:900, lineHeight:1 }}>✓</span>}
                            </div>
                            <div>
                              <p style={{ margin:0, fontSize:14, fontWeight:600, color:G[800] }}>{s.full_name}</p>
                              <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{s.roll_number}</p>
                            </div>
                          </div>
                          <Pill ok={present}>{present ? "Present" : "Absent"}</Pill>
                        </div>
                      )
                    })}
                  </div>

                  <SuccessBox msg={manualMsg}/>
                  {manualSessionId && <ErrorBox msg={manualError}/>}
                  <button onClick={saveManual} disabled={manualSaving || !manualSessionId}
                    style={{ background:G[700], color:"#fff", border:"none", borderRadius:10, padding:"11px 26px", fontSize:14, fontWeight:600, cursor:"pointer", opacity:(manualSaving || !manualSessionId)?0.5:1, fontFamily:"'DM Sans',sans-serif" }}>
                    {manualSaving ? "Saving…" : "Save Attendance"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {assignmentId && tab === "history" && (
            <div style={{ ...card, animation:"fadeUp 0.4s ease both" }}>
              <Heading label="Attendance History" />
              {!sessionDetail ? (
                <>
                  <p style={{ fontSize:13, color:"#6b7280", marginBottom:18, lineHeight:1.6 }}>
                    All recorded sessions for <strong style={{ color:G[700] }}>{selectedAssignment?.subject.name}</strong> — {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}.
                  </p>
                  {loadingHistory && <p style={{ color:"#9ca3af", fontSize:13 }}>Loading…</p>}
                  {!loadingHistory && sessions.length === 0 && (
                    <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"28px 0" }}>No sessions recorded yet for this class.</p>
                  )}
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {sessions.map(s => {
                      const p = s.total_count > 0 ? Math.round((s.present_count/s.total_count)*100) : 0
                      return (
                        <div key={s.session_id} onClick={() => loadDetail(s.session_id)} className="ma-session"
                          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderRadius:12, border:`1.5px solid ${G[200]}`, background:"#fff", cursor:"pointer", transition:"all 0.15s" }}>
                          <div>
                            <p style={{ margin:0, fontSize:14, fontWeight:700, color:G[800] }}>{fmtDate(s.date)}</p>
                            <p style={{ margin:"2px 0 0", fontSize:11, color:"#9ca3af" }}>{fmt(s.start_time)}</p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ margin:0, fontSize:16, fontWeight:700, color: p>=75 ? G[700] : "#dc2626" }}>{p}%</p>
                            <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{s.present_count}/{s.total_count} present</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div>
                  <button onClick={() => setSessionDetail(null)}
                    style={{ background:"none", border:"none", color:G[600], fontSize:13, fontWeight:700, cursor:"pointer", textDecoration:"underline", padding:"0 0 18px", display:"block", fontFamily:"'DM Sans',sans-serif" }}>
                    ← Back to sessions
                  </button>
                  <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
                    <p style={{ margin:"0 0 4px", fontWeight:700, color:G[800], fontSize:14 }}>{fmtDate(sessionDetail.date)} · {fmt(sessionDetail.start_time)}</p>
                    <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{sessionDetail.subject} · {sessionDetail.section}</p>
                  </div>
                  {loadingDetail ? <p style={{ color:"#9ca3af", fontSize:13 }}>Loading…</p> : (
                    <>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
                        <div style={{ background:G[50], border:`1.5px solid ${G[200]}`, borderRadius:12, padding:"14px", textAlign:"center" }}>
                          <p style={{ margin:0, fontSize:24, fontWeight:700, color:G[700], fontFamily:"'DM Serif Display',serif" }}>{sessionDetail.attendance.filter(r => r.status).length}</p>
                          <p style={{ margin:"4px 0 0", fontSize:11, color:"#6b7280" }}>Present</p>
                        </div>
                        <div style={{ background:"#fef2f2", border:"1.5px solid #fecaca", borderRadius:12, padding:"14px", textAlign:"center" }}>
                          <p style={{ margin:0, fontSize:24, fontWeight:700, color:"#dc2626", fontFamily:"'DM Serif Display',serif" }}>{sessionDetail.attendance.filter(r => !r.status).length}</p>
                          <p style={{ margin:"4px 0 0", fontSize:11, color:"#6b7280" }}>Absent</p>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {sessionDetail.attendance.map(r => (
                          <div key={r.student_id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${G[100]}`, background:"#fff" }}>
                            <div>
                              <p style={{ margin:0, fontSize:14, fontWeight:600, color:G[800] }}>{r.full_name}</p>
                              <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{r.roll_number}</p>
                            </div>
                            <Pill ok={r.status}>{r.status ? "Present" : "Absent"}</Pill>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!assignmentId && (
            <div style={{ textAlign:"center", padding:"64px 0" }}>
              <p style={{ color:"#9ca3af", fontSize:13 }}>Select a class above to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MarkAttendance
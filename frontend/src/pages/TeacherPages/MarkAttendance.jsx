import React, { useEffect, useRef, useState, useCallback } from "react"
import { QRCodeCanvas } from "qrcode.react"
import TeacherNav from "../../components/TeacherNav"
import api from "../../api"

const G = {
  50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
  400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
  800: "#166534", 900: "#14532d",
}

const SESSION_DURATION = 300   
const QR_INTERVAL      = 5    
const POLL_INTERVAL    = 5000  

const fmt     = iso => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
const fmtDate = d   => d   ? new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : ""
const pct     = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0


const Heading = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
    <div style={{ width: 3, height: 20, borderRadius: 2, background: `linear-gradient(to bottom,${G[500]},${G[300]})`, flexShrink: 0 }} />
    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: G[800], fontFamily: "'DM Sans',sans-serif", letterSpacing: "-0.1px" }}>{label}</h2>
  </div>
)

const ErrBox = ({ msg }) => msg ? (
  <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{msg}</div>
) : null

const OkBox = ({ msg }) => msg ? (
  <div style={{ background: G[50], border: `1.5px solid ${G[200]}`, color: G[700], borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>{msg}</div>
) : null

const Pill = ({ ok }) => (
  <span style={{
    display: "inline-block", padding: "3px 12px", borderRadius: 999,
    fontSize: 11, fontWeight: 700,
    background: ok ? G[100] : "#f3f4f6",
    color: ok ? G[700] : "#6b7280",
  }}>{ok ? "Present" : "Absent"}</span>
)

const card = {
  background: "#fff", borderRadius: 18,
  boxShadow: `0 2px 16px rgba(0,0,0,0.07),0 0 0 1px ${G[100]}`,
  padding: "26px 24px", marginBottom: 22,
}


export default function MarkAttendance() {


  const [assignments,   setAssignments]   = useState([])
  const [assignmentId,  setAssignmentId]  = useState("")
  const [sessionId,     setSessionId]     = useState(null)
  const [qrValue,       setQrValue]       = useState("")
  const [isActive,      setIsActive]      = useState(false)
  const [counter,       setCounter]       = useState(SESSION_DURATION)
  const [qrCounter,     setQrCounter]     = useState(QR_INTERVAL)
  const [sessionErr,    setSessionErr]    = useState("")
  const [students,      setStudents]      = useState([])   
  const [presentIds,    setPresentIds]    = useState([])   
  const [submitting,    setSubmitting]    = useState(false)
  const [submitMsg,     setSubmitMsg]     = useState("")
  const [submitErr,     setSubmitErr]     = useState("")
  const [tab,           setTab]           = useState("attend")
  const [sessions,      setSessions]      = useState([])
  const [sessionDetail, setSessionDetail] = useState(null)
  const [loadingHist,   setLoadingHist]   = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const pollRef     = useRef(null)
  const sessionRef  = useRef(null)
  const qrRotRef    = useRef(null)
  const qrBadgeRef  = useRef(null)
  useEffect(() => {
    api.get("/api/assignments/").then(r => setAssignments(r.data)).catch(console.error)
  }, [])
  useEffect(() => {
    if (!assignmentId) { setStudents([]); return }
    const a = assignments.find(x => x.id === parseInt(assignmentId))
    if (!a) return
    api.get(`/api/sections/${a.section.id}/students/`)
      .then(r => setStudents(r.data))
      .catch(console.error)
  }, [assignmentId, assignments])
  useEffect(() => {
    if (tab === "history" && assignmentId) loadHistory()
  }, [tab, assignmentId])
  const resetAll = val => {
    stopAllIntervals()
    setAssignmentId(val)
    setSessionId(null); setQrValue(""); setIsActive(false)
    setCounter(SESSION_DURATION); setQrCounter(QR_INTERVAL)
    setSessionErr(""); setSubmitMsg(""); setSubmitErr("")
    setPresentIds([])
    setSessions([]); setSessionDetail(null)
    setTab("attend")
  }

  const stopAllIntervals = () => {
    clearInterval(pollRef.current)
    clearInterval(sessionRef.current)
    clearInterval(qrRotRef.current)
    clearInterval(qrBadgeRef.current)
  }

  const startPolling = useCallback((sid) => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/api/attendance/session/${sid}/scans/`)
        const scannedIds = r.data.scanned_student_ids || []

        setPresentIds(prev => {
          const merged = new Set(prev)
          scannedIds.forEach(id => merged.add(id))
          return Array.from(merged)
        })
      } catch (e) { console.error("poll error", e) }
    }, POLL_INTERVAL)
  }, [])


  const startSessionTimer = useCallback(() => {
    clearInterval(sessionRef.current)
    sessionRef.current = setInterval(() => {
      setCounter(p => {
        if (p <= 1) {
          clearInterval(sessionRef.current)
          clearInterval(qrRotRef.current)
          clearInterval(qrBadgeRef.current)
          clearInterval(pollRef.current)
          setIsActive(false); setQrValue("")
          return 0
        }
        return p - 1
      })
    }, 1000)
  }, [])


  const startQrRotation = useCallback((sid) => {
    clearInterval(qrRotRef.current)
    qrRotRef.current = setInterval(async () => {
      try {
        const r = await api.post("/api/attendance/refresh-qr/", { session_id: sid })
        setQrValue(r.data.qr_token)
        setQrCounter(QR_INTERVAL)
      } catch (e) { console.error("QR refresh failed", e) }
    }, QR_INTERVAL * 1000)
  }, [])


  const startQrBadge = useCallback(() => {
    clearInterval(qrBadgeRef.current)
    qrBadgeRef.current = setInterval(() => {
      setQrCounter(p => p <= 1 ? QR_INTERVAL : p - 1)
    }, 1000)
  }, [])


  const startSession = async () => {
    setSessionErr(""); setSubmitMsg(""); setSubmitErr("")
    try {
      const r = await api.post("/api/attendance/start/", { assignment_id: parseInt(assignmentId) })
      const sid = r.data.session_id
      setSessionId(sid)
      setQrValue(r.data.qr_token)
      setIsActive(true)
      setCounter(SESSION_DURATION)
      setQrCounter(QR_INTERVAL)
      setPresentIds([])
      startSessionTimer()
      startQrRotation(sid)
      startQrBadge()
      startPolling(sid)
    } catch (e) {
      setSessionErr(e.response?.data?.error || "Failed to start session")
    }
  }


  const submitAttendance = async () => {
    if (!sessionId) { setSubmitErr("No active session."); return }
    setSubmitting(true); setSubmitMsg(""); setSubmitErr("")
    try {
      await api.post("/api/attendance/submit/", {
        session_id: sessionId,
        present_student_ids: presentIds,
      })
      stopAllIntervals()
      setIsActive(false); setQrValue("")
      setSubmitMsg(`Attendance submitted! ${presentIds.length} present, ${students.length - presentIds.length} absent.`)
      setSessionId(null)
    } catch (e) {
      setSubmitErr(e.response?.data?.error || "Failed to submit attendance")
    }
    setSubmitting(false)
  }

  const toggleStudent = id =>
    setPresentIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])


  const loadHistory = async () => {
    setLoadingHist(true); setSessions([]); setSessionDetail(null)
    try {
      const r = await api.get(`/api/attendance/sessions/?assignment_id=${assignmentId}`)
      setSessions(r.data)
    } catch (e) { console.error(e) }
    setLoadingHist(false)
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
  const sessionPct = Math.round((counter / SESSION_DURATION) * 100)
  const presentCount = presentIds.length
  const absentCount  = students.length - presentCount


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ma-tab-active  { border-bottom:2px solid ${G[700]}!important; color:${G[700]}!important; }
        .ma-tab:hover   { color:${G[600]}!important; }
        .ma-row:hover   { border-color:${G[300]}!important; }
        .ma-session:hover { border-color:${G[300]}!important; }
        .ma-select:focus  { border-color:${G[400]}!important; box-shadow:0 0 0 3px ${G[100]}!important; outline:none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: G[50], fontFamily: "'DM Sans',sans-serif" }}>
        <TeacherNav />


        <div style={{
          position: "relative",
          background: `linear-gradient(135deg,${G[900]} 0%,${G[700]} 50%,${G[500]} 100%)`,
          paddingTop: 52, paddingBottom: 58, overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -70, right: -70, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 1, animation: "fadeUp 0.4s ease both" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: G[300], letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 6 }}>Attendance</span>
            <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'DM Serif Display',serif", lineHeight: 1.15 }}>Mark Attendance</h1>
            {selectedAssignment && (
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
                {selectedAssignment.subject.name} · {selectedAssignment.section.branch.name} {selectedAssignment.section.name}
              </span>
            )}
          </div>
          <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 52, display: "block" }} viewBox="0 0 1440 52" preserveAspectRatio="none">
            <path d="M0,26 C480,65 960,0 1440,30 L1440,52 L0,52 Z" fill={G[50]} />
          </svg>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>


          <div style={{ ...card, padding: "20px 22px", marginBottom: 18, animation: "fadeUp 0.45s ease both" }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: G[600], textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Select Class</label>
            <select value={assignmentId} onChange={e => resetAll(e.target.value)}
              className="ma-select"
              style={{ width: "100%", maxWidth: 440, border: `1.5px solid ${G[200]}`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: G[900], background: G[50], cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.2s,box-shadow 0.2s" }}>
              <option value="">— Pick a class —</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.subject.name} — {a.section.branch.name} {a.section.name}</option>
              ))}
            </select>
          </div>


          {assignmentId && (
            <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${G[100]}`, marginBottom: 22, animation: "fadeUp 0.45s ease both", animationDelay: "0.05s" }}>
              {[["attend", "Take Attendance"], ["history", "History"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`ma-tab${tab === key ? " ma-tab-active" : ""}`}
                  style={{
                    padding: "10px 22px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                    color: tab === key ? G[700] : "#9ca3af",
                    borderBottom: tab === key ? `2px solid ${G[700]}` : "2px solid transparent",
                    marginBottom: -2, transition: "color 0.15s", fontFamily: "'DM Sans',sans-serif",
                  }}>{label}</button>
              ))}
            </div>
          )}


          {assignmentId && tab === "attend" && (
            <>
              <ErrBox msg={sessionErr} />
              <OkBox msg={submitMsg} />
              <ErrBox msg={submitErr} />

              {!isActive && !sessionId && !submitMsg && (

                <div style={{ ...card, textAlign: "center", padding: "40px 24px", animation: "fadeUp 0.4s ease both" }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
                  <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.6 }}>
                    Start a session for <strong style={{ color: G[700] }}>{selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}</strong>.
                    A QR code will appear alongside the student list. Students scan → they flip to Present.
                    You can manually toggle anyone before submitting.
                  </p>
                  <button onClick={startSession}
                    style={{ background: G[700], color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Start Attendance Session
                  </button>
                </div>
              )}

              {(isActive || (sessionId && !submitMsg)) && (

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)", gap: 18, animation: "fadeUp 0.4s ease both", alignItems: "start" }}>


                  <div style={{ ...card, marginBottom: 0, textAlign: "center" }}>
                    <Heading label="QR Code" />

                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 18 }}>
                      <svg width="52" height="52" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                        <circle cx="30" cy="30" r="25" fill="none" stroke={G[100]} strokeWidth="4" />
                        <circle cx="30" cy="30" r="25" fill="none"
                          stroke={counter > 60 ? G[600] : "#dc2626"} strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 25}`}
                          strokeDashoffset={`${2 * Math.PI * 25 * (1 - sessionPct / 100)}`}
                          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear,stroke 0.5s" }} />
                      </svg>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: counter > 60 ? G[700] : "#dc2626", lineHeight: 1, fontFamily: "'DM Serif Display',serif" }}>{counter}s</p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>session expires</p>
                      </div>
                    </div>

  
                    {isActive && qrValue && (
                      <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                        <div style={{ padding: 12, background: G[50], borderRadius: 14, border: `1.5px solid ${G[200]}` }}>
                          <QRCodeCanvas value={qrValue} size={180} key={qrValue} />
                        </div>


                        <div style={{
                          position: "absolute", top: -10, right: -10,
                          background: qrCounter <= 5 ? "#dc2626" : G[700],
                          color: "#fff", borderRadius: "50%", width: 36, height: 36,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, lineHeight: 1,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "background 0.3s",
                        }}>
                          {qrCounter}
                          <span style={{ fontSize: 7, opacity: 0.85 }}>sec</span>
                        </div>
                      </div>
                    )}

                    {!isActive && sessionId && (
                      <div style={{ padding: "14px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, marginBottom: 12, fontSize: 13, color: "#92400e" }}>
                        Session expired — QR inactive.<br />Review the list below and submit.
                      </div>
                    )}

                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px" }}>Rotates every <strong style={{ color: G[700] }}>{QR_INTERVAL}s</strong></p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 16px" }}>
                      Polls for new scans every <strong style={{ color: G[700] }}>5s</strong>
                    </p>

                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
                      <div style={{ background: G[100], borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: G[700], fontFamily: "'DM Serif Display',serif" }}>{presentCount}</p>
                        <p style={{ margin: 0, fontSize: 10, color: G[600] }}>Present</p>
                      </div>
                      <div style={{ background: "#fef2f2", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#dc2626", fontFamily: "'DM Serif Display',serif" }}>{absentCount}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#dc2626" }}>Absent</p>
                      </div>
                      <div style={{ background: G[50], border: `1px solid ${G[200]}`, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: G[800], fontFamily: "'DM Serif Display',serif" }}>{students.length}</p>
                        <p style={{ margin: 0, fontSize: 10, color: G[600] }}>Total</p>
                      </div>
                    </div>
                  </div>


                  <div style={{ ...card, marginBottom: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <Heading label="Student List" />
                      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                        <button onClick={() => setPresentIds(students.map(s => s.id))}
                          style={{ background: "none", border: "none", color: G[700], fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "'DM Sans',sans-serif" }}>All Present</button>
                        <button onClick={() => setPresentIds([])}
                          style={{ background: "none", border: "none", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "'DM Sans',sans-serif" }}>All Absent</button>
                      </div>
                    </div>

                    <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px" }}>
                      Students who scan the QR flip to <strong style={{ color: G[700] }}>Present</strong> automatically. Toggle anyone to override.
                    </p>

                    {students.length === 0 ? (
                      <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No students found in this section.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto", marginBottom: 18, paddingRight: 2 }}>
                        {students.map(s => {
                          const present = presentIds.includes(s.id)
                          return (
                            <div key={s.id} onClick={() => toggleStudent(s.id)} className="ma-row"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "11px 13px", borderRadius: 10,
                                border: `1.5px solid ${present ? G[300] : G[200]}`,
                                background: present ? G[50] : "#fff",
                                cursor: "pointer", transition: "all 0.12s",
                              }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                {/* Checkbox */}
                                <div style={{
                                  width: 17, height: 17, borderRadius: 5,
                                  border: `2px solid ${present ? G[600] : G[300]}`,
                                  background: present ? G[600] : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  flexShrink: 0, transition: "all 0.12s",
                                }}>
                                  {present && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: G[800] }}>{s.full_name}</p>
                                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.roll_number}</p>
                                </div>
                              </div>
                              <Pill ok={present} />
                            </div>
                          )
                        })}
                      </div>
                    )}


                    <button onClick={submitAttendance} disabled={submitting || students.length === 0}
                      style={{
                        width: "100%", background: G[700], color: "#fff", border: "none",
                        borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700,
                        cursor: (submitting || students.length === 0) ? "not-allowed" : "pointer",
                        opacity: (submitting || students.length === 0) ? 0.5 : 1,
                        fontFamily: "'DM Sans',sans-serif", transition: "opacity 0.2s",
                      }}>
                      {submitting ? "Submitting…" : `Submit Attendance (${presentCount} Present)`}
                    </button>
                    <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: "8px 0 0" }}>
                      Submitting will close the session and save to records.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}


          {assignmentId && tab === "history" && (
            <div style={{ ...card, animation: "fadeUp 0.4s ease both" }}>
              <Heading label="Attendance History" />
              {!sessionDetail ? (
                <>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.6 }}>
                    All submitted sessions for <strong style={{ color: G[700] }}>{selectedAssignment?.subject.name}</strong> — {selectedAssignment?.section.branch.name} {selectedAssignment?.section.name}.
                  </p>
                  {loadingHist && <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</p>}
                  {!loadingHist && sessions.length === 0 && (
                    <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "28px 0" }}>No sessions recorded yet.</p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sessions.map(s => {
                      const p = pct(s.present_count, s.total_count)
                      return (
                        <div key={s.session_id} onClick={() => loadDetail(s.session_id)} className="ma-session"
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${G[200]}`, background: "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G[800] }}>{fmtDate(s.date)}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{fmt(s.start_time)}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: p >= 75 ? G[700] : "#dc2626" }}>{p}%</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.present_count}/{s.total_count} present</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div>
                  <button onClick={() => setSessionDetail(null)}
                    style={{ background: "none", border: "none", color: G[600], fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: "0 0 16px", display: "block", fontFamily: "'DM Sans',sans-serif" }}>
                    ← Back to sessions
                  </button>
                  <div style={{ background: G[50], border: `1.5px solid ${G[200]}`, borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, color: G[800], fontSize: 14 }}>{fmtDate(sessionDetail.date)} · {fmt(sessionDetail.start_time)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{sessionDetail.subject} · {sessionDetail.section}</p>
                  </div>
                  {loadingDetail ? <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading…</p> : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        <div style={{ background: G[50], border: `1.5px solid ${G[200]}`, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: G[700], fontFamily: "'DM Serif Display',serif" }}>{sessionDetail.attendance.filter(r => r.status).length}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Present</p>
                        </div>
                        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#dc2626", fontFamily: "'DM Serif Display',serif" }}>{sessionDetail.attendance.filter(r => !r.status).length}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6b7280" }}>Absent</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {sessionDetail.attendance.map(r => (
                          <div key={r.student_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${G[100]}`, background: "#fff" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: G[800] }}>{r.full_name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{r.roll_number}</p>
                            </div>
                            <Pill ok={r.status} />
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
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#9ca3af", fontSize: 13 }}>Select a class above to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}